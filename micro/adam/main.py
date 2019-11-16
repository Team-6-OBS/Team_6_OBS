from flask import Flask, request, render_template, make_response
import sqlalchemy as db
import pymysql
import jwt
import http
import json
import requests
import os

app = Flask(__name__)

def authenticate(auth):
    try:
        decoded = jwt.decode(auth, os.getenv('SECRET'), algorithms='HS256')
        output = {}
        output['username'] = decoded['username']
        output['email'] = decoded['email']

    except jwt.ExpiredSignatureError:
        output = 'Access token is missing or invalid'
    except jwt.DecodeError:
        output = 'Access token is missing or invalid'
    return output

def save_to_db(b_type, name, acc, price, amt, inventory):
    if name != '' and acc != '' and float(price) > 0 and int(amt) > 0:
        if(b_type == 'BUY'):
            if inventory - int(amt) > 0:
                sql = 'INSERT INTO buy_sell(b_type, username, t_account, price, quantity) VALUES(\'SELL\', \'admin\', \'Bank Stock Inventory\', \'' + str(price) + '\', \'' + str(amt) + '\'),'
                sql += '(\'' + b_type + '\', \'' + name + '\', \'' + acc + '\', \'' + str(price) + '\', \'' + str(amt) + '\');'
                buy = query_db(sql)
                return 'Bought from stock inventory'
            else:
                required = int(amt) - inventory + 100
                sql = 'INSERT INTO buy_sell(b_type, username, t_account, price, quantity) VALUES(\'BUY\', \'admin\', \'Bank Stock Inventory\', \'' + str(price) + '\', \'' + str(required) + '\'),'
                sql += '(\'SELL\', \'admin\', \'Bank Stock Inventory\', \'' + str(price) + '\', \'' + str(amt) + '\'),'
                sql += '(\'' + b_type + '\', \'' + name + '\', \'' + acc + '\', \'' + str(price) + '\', \'' + str(amt) + '\');'
                buy = query_db(sql)
                return 'Stock inventory overdrawn, inventory bought needed amt plus 100 and completed the buy'
        elif(b_type == 'SELL'):

            sql = 'INSERT INTO buy_sell(b_type, username, t_account, price, quantity) VALUES(\'BUY\', \'admin\', \'Bank Stock Inventory\', \'' + str(price) + '\', \'' + str(amt) + '\'),'
            sql += '(\'' + b_type + '\', \'' + name + '\', \'' + acc + '\', \'' + str(price) + '\', \'' + str(amt) + '\');'
            sell = query_db(sql)
            return 'Sold to stock inventory'
    else:
        return 'Invalid order amount or quoted price'

def get_stock_inventory():

    bought_query = 'SELECT sum(quantity) AS bought FROM buy_sell WHERE (username = \'admin\' AND b_type = \'BUY\') OR (username != \'admin\' AND b_type = \'SELL\')'
    bought = query_db(bought_query)[0][0]

    sold_query = 'SELECT sum(quantity) AS sold FROM buy_sell WHERE username != \'admin\' AND b_type = \'BUY\''
    sold = query_db(sold_query)[0][0]

    if sold != None:
        remaining = int(bought) - int(sold)
    else:
        remaining = bought
    return remaining

def form_buy_sell_response(b_type, name, acc, price, amt):

    value = float(price) * int(amt)
    transaction = json.loads('{}')

    if b_type == 'BUY':
        output_str = "{\"TransactionType\" : \"BUY\", \"User\" : \"" + name + "\", \"Account\" : \"" + acc + "\", \"Price\" : " + str(price) + ", \"Quantity\" : " + str(amt) + ", \"CostToUser\" : " + str(value)+ "}"
    elif b_type == 'SELL':
        output_str = "{\"TransactionType\" : \"SELL\", \"User\" : \"" + name + "\", \"Account\" : \"" + acc + "\", \"Price\" : " + str(price) + ", \"Quantity\" : " + str(amt) + ", \"CostToUser\" : " + str(value)+ "}"

    try:
        transaction = json.loads(output_str)
    except json.JSONDecodeError:
        print('Error while forming JSON response for transaction')
    return transaction

def get_delayed_price():

    res = quotes()
    new_res = res[0]
    delayed = round(float(new_res['quotes']['quote']['last']), 2)

    return delayed

def query_db(sql):
    res = db.create_engine(os.getenv('DB_CONN_STRING_ADAM')).connect().execute(sql)
    if 'SELECT' in sql:
        res = res.fetchall()
    return res

#utilize get requests for quotes (using auth header) and transcations (using auth header with admin user)
#and post requests for buy and sell, returning data for the sale made/failed
@app.route('/api/quotes', methods=["GET"])
def quotes():
    conn = http.client.HTTPSConnection('sandbox.tradier.com', 443, timeout=15)

    headers = {'Accept' : 'application/json', 'Authorization' : 'Bearer ' + os.getenv('TRADIER_BEARER')}
    quote = json.loads('{}')
    conn.request('GET', '/v1/markets/quotes?symbols=NTDOY', None, headers)
    try:
        res = conn.getresponse()
        quote = json.loads(res.read().decode('utf-8'))
    except http.client.HTTPException as e:
        print('Quote Request Failed')

    return quote, 200

@app.route('/api/buy', methods=['POST'])
def buy():
    auth = request.headers.get('auth')
    quantity = request.headers.get('quantity')
    account = request.headers.get('account')

    user_data = authenticate(auth)

    price = get_delayed_price()

    if type(user_data) == type({}):
        saved = save_to_db('BUY', user_data['username'], account, price, quantity, get_stock_inventory())
        buy = form_buy_sell_response('BUY', user_data['username'], account, price, quantity)
        return buy, 200
    else:
        return user_data, 401

@app.route('/api/sell', methods=['POST'])
def sell():
    auth = request.headers.get('auth')
    quantity = request.headers.get('quantity')
    account = request.headers.get('account')

    user_data = authenticate(auth)

    price = get_delayed_price()

    if type(user_data) == type({}):
        saved = save_to_db('SELL', user_data['username'], account, price, quantity, get_stock_inventory())
        sell = form_buy_sell_response('SELL', user_data['username'], account, price, quantity)
        return sell, 200
    else:
        return user_data, 401

@app.route('/api/transactions', methods=['GET'])
def transactions():
    auth = request.headers.get('auth')
    transactions = json.loads('{}')

    user_data = authenticate(auth)
    if type(user_data) == type({}):
        if user_data['email'] == 'admin@obs.com':

            sql = 'SELECT JSON_OBJECT(\'bid\', bid, \'b_type\', b_type, \'username\', username, \'t_account\', t_account, \'price\', price, \'quantity\', quantity) FROM buy_sell'
            query_res = query_db(sql)
            parsed_query_res = '{\'transactions\': ['

            for entry in query_res:
                parsed_query_res = parsed_query_res + entry[0] + ', '
            parsed_query_res = parsed_query_res[:len(parsed_query_res)-2]
            parsed_query_res += ']}'
            transactions = json.loads(parsed_query_res.replace('\'', '\"'))
            return transactions, 200
        else:
            return 'Only the admin may view transactions', 500
    else:
        return 'Access token is missing or invalid', 401

if __name__ == "__main__":

    app.run(debug=True)
