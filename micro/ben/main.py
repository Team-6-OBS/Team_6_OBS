"""This module controls SEGA Stock (SGAMY)"""

import os
import http
import json
from flask import Flask, request
import sqlalchemy as db
import jwt

app = Flask(__name__)

def authenticate(auth):
    """This function takes a token and returns the unencrypted results or fails"""
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
    """This function takes buy_sell object and saves it to the db"""
    if name != '' and acc != '' and float(price) > 0 and int(amt) > 0:
        if b_type == 'BUY':
            if inventory - int(amt) > 0:
                sql = 'INSERT INTO buy_sell(b_type, username, t_account, price, quantity) '
                sql += 'VALUES(\'SELL\', \'admin\', \'Bank Stock Inventory\', \'' + str(price)
                sql += '\', \'' + str(amt) + '\'),'
                sql += '(\'' + b_type + '\', \'' + name + '\', \'' + acc + '\', \''
                sql += str(price) + '\', \'' + str(amt) + '\');'
                query_db(sql)
                return 'Bought from stock inventory'

            required = int(amt) - inventory + 100
            sql = 'INSERT INTO buy_sell(b_type, username, t_account, price, quantity) '
            sql += 'VALUES(\'BUY\', \'admin\', \'Bank Stock Inventory\', \'' + str(price)
            sql += '\', \'' + str(required) + '\'),'
            sql += '(\'SELL\', \'admin\', \'Bank Stock Inventory\', \'' + str(price)
            sql += '\', \'' + str(amt) + '\'),'
            sql += '(\'' + b_type + '\', \'' + name + '\', \'' + acc + '\', \'' + str(price)
            sql += '\', \'' + str(amt) + '\');'
            query_db(sql)

            ret_str = 'Stock inventory overdrawn, inventory bought'
            ret_str += ' needed amt plus 100 and completed the buy'
            return ret_str

        sql = 'INSERT INTO buy_sell(b_type, username, t_account, price, quantity) '
        sql += 'VALUES(\'BUY\', \'admin\', \'Bank Stock Inventory\', \'' + str(price)
        sql += '\', \'' + str(amt) + '\'),'
        sql += '(\'' + b_type + '\', \'' + name + '\', \'' + acc + '\', \'' + str(price)
        sql += '\', \'' + str(amt) + '\');'
        query_db(sql)
        return 'Sold to stock inventory'

    return 'Invalid order amount or quoted price'

def get_stock_inventory():
    """this function gets the current OBS stock"""

    bought_query = 'SELECT sum(quantity) AS bought FROM buy_sell WHERE '
    bought_query += '(username = \'admin\' AND b_type = \'BUY\') OR (username != \'admin\' '
    bought_query += 'AND b_type = \'SELL\')'
    bought = query_db(bought_query)[0][0]

    sold_query = 'SELECT sum(quantity) AS sold FROM buy_sell WHERE username '
    sold_query += '!= \'admin\' AND b_type = \'BUY\''
    sold = query_db(sold_query)[0][0]

    if sold is not None:
        remaining = int(bought) - int(sold)
    else:
        remaining = bought
    return remaining

def form_buy_sell_response(b_type, name, acc, price, amt):
    """Helper function to format the buy_sell JSON response"""

    value = float(price) * int(amt)
    transaction = json.loads('{}')

    if b_type == 'BUY':
        output_str = "{\"TransactionType\" : \"BUY\", \"User\" : \"" + name
        output_str += "\", \"Account\" : \"" + acc + "\", \"Price\" : " + str(price)
        output_str += ", \"Quantity\" : " + str(amt) + ", \"CostToUser\" : " + str(value)+ "}"
    elif b_type == 'SELL':
        output_str = "{\"TransactionType\" : \"SELL\", \"User\" : \"" + name
        output_str += "\", \"Account\" : \"" + acc + "\", \"Price\" : " + str(price)
        output_str += ", \"Quantity\" : " + str(amt) + ", \"CostToUser\" : " + str(value)+ "}"

    try:
        transaction = json.loads(output_str)
    except json.JSONDecodeError:
        print('Error while forming JSON response for transaction')
    return transaction

def get_delayed_price():
    """queries tradier to get the stock price"""

    res = quotes()
    new_res = res[0]
    delayed = round(float(new_res['quotes']['quote']['last']), 2)

    return delayed

def query_db(sql):
    """sends a query to the db deciding between a select or insert types"""
    res = db.create_engine(os.getenv('BEN_DB')).connect().execute(sql)
    if 'SELECT' in sql:
        res = res.fetchall()
    return res

#utilize get requests for quotes (using auth header)
#and transcations (using auth header with admin user)
#and post requests for buy and sell, returning data for the sale made/failed
@app.route('/api/quotes', methods=["GET"])
def quotes():
    """returns a tradier quote for SEGA stock"""
    conn = http.client.HTTPSConnection('sandbox.tradier.com', 443, timeout=15)
    bearer_str = 'Bearer ' + os.getenv('TRADIER_BEARER')
    headers = {'Accept' : 'application/json', 'Authorization' : bearer_str}
    quote = json.loads('{}')
    conn.request('GET', '/v1/markets/quotes?symbols=SGAMY', None, headers)
    try:
        res = conn.getresponse()
        quote = json.loads(res.read().decode('utf-8'))
    except http.client.HTTPException:
        print('Quote Request Failed')

    return quote, 200

@app.route('/api/buy', methods=['POST'])
def buy():
    """take an account and quantity and attempts to purchase that much stock to that account"""
    auth = request.headers.get('auth')
    quantity = request.headers.get('quantity')
    account = request.headers.get('account')

    user_data = authenticate(auth)

    price = get_delayed_price()

    if isinstance(user_data, dict):
        save_to_db('BUY', user_data['username'], account,
                   price, quantity, get_stock_inventory())
        buy_res = form_buy_sell_response('BUY', user_data['username'], account, price, quantity)
        return buy_res, 200

    return user_data, 401

@app.route('/api/sell', methods=['POST'])
def sell():
    """take an account and quantity and attempts to sell that much stock from that account"""
    auth = request.headers.get('auth')
    quantity = request.headers.get('quantity')
    account = request.headers.get('account')

    user_data = authenticate(auth)

    price = get_delayed_price()

    if isinstance(user_data, dict):
        save_to_db('SELL', user_data['username'], account, price,
                   quantity, get_stock_inventory())
        sell_res = form_buy_sell_response('SELL', user_data['username'], account, price, quantity)
        return sell_res, 200

    return user_data, 401

@app.route('/api/transactions', methods=['GET'])
def transactions():
    """returns all buys and sells logged to this microservice"""
    auth = request.headers.get('auth')

    user_data = authenticate(auth)
    if isinstance(user_data, dict):
        if user_data['email'] == 'admin@obs.com':

            sql = 'SELECT JSON_OBJECT(\'bid\', bid, \'b_type\', b_type, \'username\', username, '
            sql += '\'t_account\', t_account, \'price\', price, \'quantity\', quantity) '
            sql += 'FROM buy_sell'
            query_res = query_db(sql)
            parsed_query_res = '{\'transactions\': ['

            for entry in query_res:
                parsed_query_res = parsed_query_res + entry[0] + ', '
            parsed_query_res = parsed_query_res[:len(parsed_query_res)-2]
            parsed_query_res += ']}'
            trans = json.loads(parsed_query_res.replace('\'', '\"'))
            return trans, 200

        return 'Only the admin may view transactions', 500

    return 'Access token is missing or invalid', 401

if __name__ == "__main__":

    app.run(debug=True)
