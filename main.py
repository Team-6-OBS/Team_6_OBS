from flask import Flask, render_template, Blueprint, request, make_response, jsonify
import jwt
import sqlalchemy as db
import pymysql
import time
import json
import http

app = Flask(__name__)

app.config['SECRET'] = "XCAP05H6LoKvbRRa/QkqLNMI7cOHguaRyHzyg7n5qEkGjQmtBhz4SzYh4Fqwjyi3KJHlSXKPwVu2+bXr6CtpgQ=="
app.config['DB_HOST'] = "35.224.129.168"
app.config['DB_USER'] = "root"
app.config['DB_PASS'] = "team6password12345"
app.config['DB_NAME'] = "main_server"

engine = db.create_engine('mysql+pymysql://' + app.config['DB_USER'] + ':' + app.config['DB_PASS'] + '@' + app.config['DB_HOST'] + '/' + app.config['DB_NAME'], pool_pre_ping=True)
app.config['DB_CONN'] = engine.connect()

######## BEGIN LOG FUNCTIONS #########

def log_app_transaction(t_type, t_response, log_text, req_type):

    sql = 'INSERT INTO logs(type, response, log, request) VALUES (\'' + str(t_type) + '\', '
    sql = sql + '\'' + str(t_response) + '\', ' + '\'' + str(log_text) + '\', ' + '\'' + str(req_type) + '\')'
    res = query_db(sql)

    return(res)

@app.route('/getlogs', methods=["GET"])
def get_logs():

    user = get_user(request)

    if user == 'Access token is missing or invalid':
        log_app_transaction('OBS', 'Access token is missing or invalid', 'Logs Page', request.method)
        return "No User Logged In", 404
    else:
        if user['username'] == 'admin':
            sql = 'SELECT JSON_OBJECT(\'id\', id, \'type\', type, '
            sql += '\'response\', response, \'log_date\', log_date, \'log\', log, \'request\', request) FROM logs;'
            query_res = query_db(sql)

            parsed_query_res = '{\'logs\': ['

            for entry in query_res:
                parsed_query_res = parsed_query_res + entry[0] + ', '
            parsed_query_res = parsed_query_res[:len(parsed_query_res)-2]
            parsed_query_res += ']}'
            logs = json.loads(parsed_query_res.replace('\'', '\"'))
            return logs

        return 'Unauthorized User', 500

######## END LOG FUNCTIONS ########



######## BEGIN BUY/SELL HELPER FUNCTIONS ########

@app.route('/getpnl', methods=["GET"])
def get_pnl():
    """this function gets the current OBS profits/losses table"""

    sql = 'SELECT JSON_OBJECT(\'b_type\', b_type, \'username\', username, \'price\', price, '
    sql += ' \'t_account\', t_account, \'stocktype\', stocktype, \'quantity\', quantity) '
    sql += 'FROM buy_sell;'
    query_res = query_db(sql)

    parsed_query_res = '{\'transactions\': ['

    for entry in query_res:
        parsed_query_res = parsed_query_res + entry[0] + ', '
    parsed_query_res = parsed_query_res[:len(parsed_query_res)-2]
    parsed_query_res += ']}'
    transactions = json.loads(parsed_query_res.replace('\'', '\"'))

    return transactions

def update_totals(amt, price, acc, t_type, sym, user):

    stock_price_total = amt * price

    stock_col = sym.lower() + '_stock'

    sql = 'SELECT dollars, ' + stock_col + ' FROM account_totals WHERE account = \'' + acc + '\' AND username = \'' + user + '\';'
    values = query_db(sql)
    dollars = values[0][0]
    stock = values[0][1]

    if t_type == 'BUY':
        updated_dollars = dollars - stock_price_total
        updated_stock = stock + amt
    else:
        updated_dollars = dollars + stock_price_total
        updated_stock = stock - amt

    sql = 'UPDATE account_totals SET dollars = \'' + str(updated_dollars) + '\', '
    sql += stock_col + '= \'' + str(updated_stock) + '\' WHERE account = \'' + acc + '\' AND username = \'' + user + '\';'
    res = query_db(sql)

    return res

def authenticate(auth):
    """This function takes a token and returns the unencrypted results or fails"""
    try:
        decoded = jwt.decode(auth, app.config['SECRET'], algorithms='HS256')
        output = {}
        output['username'] = decoded['username']
        output['email'] = decoded['email']

    except jwt.ExpiredSignatureError:
        output = 'Access token is missing or invalid'
    except jwt.DecodeError:
        output = 'Access token is missing or invalid'
    return output

def get_user(request):
    """Checks both the cookies and the headers in the request to see if we can get the user"""

    #token can either be in the cookies or the header to facilitate either browser or api use of the app
    cookie = request.cookies.get('OBS_COOKIE')
    token = request.headers.get('auth')
    user = "";

    #check the cookie first
    if cookie != None:
        user = authenticate(cookie)
        if user != 'Access token is missing or invalid':
            return user
    elif token != None:
        user = authenticate(token)
        if user != 'Access token is missing or invalid':
            return user
    else:
        return 'Access token is missing or invalid'

def save_to_db(b_type, name, acc, price, amt, stock_inventory, user_inventory, sym):
    """This function takes buy_sell object and saves it to the db"""
    if name != '' and acc != '' and float(price) > 0 and int(amt) > 0:
        if b_type == 'BUY':
            if stock_inventory - int(amt) > 0:
                #edit buy_sell values
                sql = 'INSERT INTO buy_sell(b_type, username, t_account, price, stocktype, quantity) '
                sql += 'VALUES(\'SELL\', \'admin\', \'Bank Stock Inventory\', \'' + str(price)
                sql += '\', \'' + sym + '\', \'' + str(amt) + '\'),'
                sql += '(\'' + b_type + '\', \'' + name + '\', \'' + acc + '\', \''
                sql += str(price) + '\', \'' + sym + '\', \'' + str(amt) + '\');'
                query_db(sql)

                #edit account_totals values
                update_totals(int(amt), float(price), acc, 'BUY', sym, name)
                update_totals(int(amt), float(price), 'Bank Stock Inventory', 'SELL', sym, 'admin')

                return 'Bought from stock inventory'

            #edit buy_sell values
            required = int(amt) - stock_inventory + 100
            sql = 'INSERT INTO buy_sell(b_type, username, t_account, price, stocktype, quantity) '
            sql += 'VALUES(\'BUY\', \'admin\', \'Bank Stock Inventory\', \'' + str(price)
            sql += '\', \'' + str(required) + '\'),'
            sql += '(\'SELL\', \'admin\', \'Bank Stock Inventory\', \'' + str(price)
            sql += '\', \'' + sym + '\', \'' + str(amt) + '\'),'
            sql += '(\'' + b_type + '\', \'' + name + '\', \'' + acc + '\', \'' + str(price)
            sql += '\', \'' + sym + '\', \'' + str(amt) + '\');'
            query_db(sql)

            #edit account_totals values
            update_totals(int(amt), float(price), acc, 'BUY', sym, name)
            update_totals(int(amt), float(price), 'Bank Stock Inventory', 'SELL', sym, 'admin')

            ret_str = 'Stock inventory overdrawn, inventory bought'
            ret_str += ' needed amt plus 100 and completed the buy'
            return ret_str

        if user_inventory - int(amt) >= 0:
            #edit buy_sell values
            sql = 'INSERT INTO buy_sell(b_type, username, t_account, price, stocktype, quantity) '
            sql += 'VALUES(\'BUY\', \'admin\', \'Bank Stock Inventory\', \'' + str(price)
            sql += '\', \'' + sym + '\', \'' + str(amt) + '\'),'
            sql += '(\'' + b_type + '\', \'' + name + '\', \'' + acc + '\', \'' + str(price)
            sql += '\', \'' + sym + '\', \'' + str(amt) + '\');'
            query_db(sql)

            #edit account_totals values
            update_totals(int(amt), float(price), acc, 'SELL', sym, name)
            update_totals(int(amt), float(price), 'Bank Stock Inventory', 'BUY', sym, 'admin')

            return 'Sold to stock inventory'
        return 'User Inventory does not have enough shares to sell the requested amount'

    return 'Invalid order amount or quoted price'

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
        output_str += ", \"Quantity\" : " + str(amt) + ", \"PaymentToUser\" : " + str(value)+ "}"

    try:
        transaction = json.loads(output_str)
    except json.JSONDecodeError:
        print('Error while forming JSON response for transaction')
    return transaction

def get_delayed_price(stock):
    """queries tradier to get the stock price"""

    res = quotes()
    new_res = res[0]['quotes']['quote']
    delayed = 0.0
    for item in new_res:
        if item['symbol'] == stock:
            delayed = round(float(item['last']), 2)

    return delayed

def query_db(sql):
    """sends a query to the db deciding between a select or insert types"""
    res = app.config['DB_CONN'].execute(sql)

    if 'SELECT' in sql:
        res = res.fetchall()
    return res

######## END BUY/SELL HELPER FUNCTIONS ########



######## BEGIN DASHBOARD FUNCTIONS ########
@app.route('/add', methods=["POST"])
def add_funds():
    decoded_jwt = get_user(request)

    if decoded_jwt == 'Access token is missing or invalid':
        log_app_transaction('OBS', 'Access token is missing or invalid', 'Dashboard Add Funds Button', request.method)
        return "No User Logged In", 404
    else:
        money_added = request.form.get('money')
        if float(money_added) > 0:
            acc = request.form.get('account')
            sql = 'SELECT dollars FROM account_totals WHERE username = \'' + decoded_jwt['username'] + '\' AND account = \'' + acc + '\';'

            dollars = app.config['DB_CONN'].execute(sql).fetchall()[0][0]
            new_dollars = round(float(dollars) + float(money_added), 2)

            sql = 'UPDATE account_totals SET dollars = \''
            sql = sql + str(new_dollars) + '\' WHERE username = \'' + decoded_jwt['username'] + '\' AND account = \'' + acc + '\';'

            res = app.config['DB_CONN'].execute(sql)

            log_app_transaction('OBS', 'Funds Successfully Added', 'Dashboard Add Funds Button', request.method)
            return 'Funds Sucessfully Added', 200

    log_app_transaction('OBS', 'Invalid Addition Amount', 'Dashboard Add Funds Button', request.method)
    return 'Invalid Addition Amount', 500

@app.route('/newacc', methods=["POST"])
def create_account():
    decoded_jwt = get_user(request)

    if decoded_jwt == 'Access token is missing or invalid':
        log_app_transaction('OBS', 'Access token is missing or invalid', 'Dashboard Creat Account Button', request.method)
        return "No User Logged In", 404
    else:
        acc_name = request.form.get('account')

        sql = 'SELECT account from account_totals WHERE username = \'' + decoded_jwt['username'] + '\';'
        current_accounts = app.config['DB_CONN'].execute(sql).fetchall()

        exists = False
        if len(current_accounts) < 3:
            for acc in current_accounts:
                if acc_name == acc[0]:
                    exists = True

            if not exists:
                sql = 'INSERT INTO account_totals(account, username) VALUES(\'' + acc_name +  '\', \'' + decoded_jwt['username'] + '\');'
                app.config['DB_CONN'].execute(sql)

                log_app_transaction('OBS', 'Account Added Successfully', 'Dashboard Create Account Button', request.method)
                return 'Account Added Successfully', 200

            log_app_transaction('OBS', 'Account Already Exists', 'Dashboard Create Account Button', request.method)
            return 'Account Already Exists', 500

        log_app_transaction('OBS', 'User Bank Account Limit Reached', 'Dashboard Create Account Button', request.method)
        return 'User Bank Account Limit Reached', 500

@app.route('/quotes')
def quotes():
    conn = http.client.HTTPSConnection('sandbox.tradier.com', 443, timeout=15)
    bearer_str = 'Bearer ' + 'IymVCsUIpSobaA3RGFqGtWGWzMUQ'
    headers = {'Accept' : 'application/json', 'Authorization' : bearer_str}
    quote = json.loads('{}')
    conn.request('GET', '/v1/markets/quotes?symbols=NTDOY,DIS,ATVI,SGAMY,UBSFY', None, headers)
    try:
        res = conn.getresponse()
        quote = json.loads(res.read().decode('utf-8'))
    except http.client.HTTPException:
        return 'Quote request failed', 500

    return quote, 200

@app.route('/totals')
def total():
    decoded_jwt = get_user(request)

    if decoded_jwt == 'Access token is missing or invalid':
        return "No User Logged In", 404
    else:
        #user is logeed in so try and get their dashboard
        sql = 'SELECT * from account_totals where username = \'' + decoded_jwt['username'] + '\''
        try:
            accounts = app.config['DB_CONN'].execute(sql).fetchall()
            nullAccounts = 3 - len(accounts)
            #loop through each account to build return array
            retArray = []
            for account in accounts:
                newDict = {
                    'name': account[0],
                    'money': account[2],
                    'ntdoy': account[4],
                    'sgamy': account[5],
                    'atvi': account[6],
                    'dis': account[3],
                    'ubsfy': account[7]
                }
                retArray.append(newDict)
            #loop through remaining slots to fill in null
            i = 0
            while i < nullAccounts:
                retArray.append(None)
                i+=1
            #return as json
            return jsonify(retArray)
        except Exception as e:
            print(e)
            return 'Database error occurred', 500

@app.route('/buy', methods=['POST'])
def buy():
    """take an account and quantity and attempts to purchase that much stock to that account"""
    #auth = request.headers.get('auth')
    quantity = request.form.get('quantity')
    account = request.form.get('account')
    stock_symbol = request.form.get('symbol')

    user_data = get_user(request)
    if user_data == 'Access token is missing or invalid':
        log_app_transaction('AUTH', 'Access token is missing or invalid', 'Dashboard Buy Button', request.method)
        return "No User Logged In", 404

    price = get_delayed_price(stock_symbol)

    if isinstance(user_data, dict):
        stock_col = stock_symbol.lower() + '_stock'

        sql = 'SELECT ' + stock_col + ' FROM account_totals WHERE account = \'Bank Stock Inventory\' AND username = \'admin\''
        bank_stocks = query_db(sql)[0][0]

        sql = 'SELECT ' + stock_col + ' FROM account_totals WHERE account = \'' + account + '\' AND username = \'' + user_data['username'] + '\''
        user_stocks = query_db(sql)[0][0]

        check = save_to_db('BUY', user_data['username'], account,
                           price, quantity, bank_stocks,
                           user_stocks, stock_symbol)
        if check != 'Invalid order amount or quoted price':
           buy_res = form_buy_sell_response('BUY', user_data['username'], account, price, quantity)

           log_app_transaction('STOCK', 'Buy Successful', 'Dashboard Buy Button', request.method)
           return buy_res, 200

        log_app_transaction('STOCK', 'Invalid order amount or quoted price', 'Dashboard Buy Button', request.method)
        return check, 500

@app.route('/sell', methods=['POST'])
def sell():
    """take an account and quantity and attempts to sell that much stock from that account"""
    quantity = request.form.get('quantity')
    account = request.form.get('account')
    stock_symbol = request.form.get('symbol')

    user_data = get_user(request)
    if user_data == 'Access token is missing or invalid':
        log_app_transaction('AUTH', 'Access token is missing or invalid', 'Dashboard Buy Button', request.method)
        return "No User Logged In", 404

    price = get_delayed_price(stock_symbol)

    if isinstance(user_data, dict):
        stock_col = stock_symbol.lower() + '_stock'

        sql = 'SELECT ' + stock_col + ' FROM account_totals WHERE account = \'' + account + '\' AND username = \'' + user_data['username'] + '\''
        user_stocks = query_db(sql)[0][0]

        check = save_to_db('SELL', user_data['username'], account, price,
                           quantity, 5000, user_stocks, stock_symbol)
        if (check != 'User Inventory does not have enough shares to sell the requested amount'
        and check != 'Invalid order amount or quoted price'):

           sell_res = form_buy_sell_response('SELL', user_data['username'], account, price, quantity)

           log_app_transaction('STOCK', 'Sell Successful', 'Dashboard Sell Button', request.method)
           return sell_res, 200

        log_app_transaction('STOCK', check, 'Dashboard Sell Button', request.method)
        return check, 500

######## END DASHBOARD FUNCTIONS ########



######## BEGIN USER ROUTES ########
@app.route('/')
def logs_view():
    return render_template("obs_navigation.html")

@app.route('/logs')
def home():
    return render_template("logs.html")

@app.route('/signup', methods=["GET", "POST"])
def signup():
    if request.method == "GET":
        return render_template("signup.html")

    if request.method == "POST":
        username = request.form.get("username", None)
        password = request.form.get("password", None)
        email = request.form.get("email", None)

        #check whether all the data was passed in properly
        if username == None or password == None or email == None:
            log_app_transaction('Auth', 'Failed Request', 'User Sign Up Page', request.method)
            return "Failed Request", 404

        #check database for existing user
        sql = 'SELECT uid, username, email FROM accounts WHERE email=\'' + email + '\''
        existing = app.config['DB_CONN'].execute(sql).fetchall()
        if len(existing) == 0:
            #send to database
            sql = 'INSERT INTO accounts (username, password, email) VALUES (\'' + username + '\',\'' + password + '\',\'' + email + '\');'
            num = app.config['DB_CONN'].execute(sql)

            #query for additional auto-generated user info
            sql = 'SELECT uid, username, email FROM accounts WHERE email=\'' + email + '\''
            test = app.config['DB_CONN'].execute(sql).fetchall()

            epoch_time = int(time.time()) + 3600   #gets the epoch time in UTC this is used as an expiration for JWT and add an hour
            payload = {'username' : test[0][0], 'email' : test[0][1], 'exp' : epoch_time}
            token = jwt.encode(payload, app.config['SECRET'], algorithm='HS256')

            log_app_transaction('AUTH', 'Successfully Created Account', 'User Sign Up Page', request.method)
            return 'Successfully Created Account', 200
        else:
            log_app_transaction('AUTH', 'Email address or username already in use', 'User Sign Up Page', request.method)
            return "Email address or username already in use", 400

@app.route('/login', methods=["GET", "POST", "DELETE"])
def login():
    if request.method == "DELETE":
        #clear the cookie that saves user logged in
        res = make_response()
        res.set_cookie("OBS_COOKIE", value="", httponly=True, expires=0)
        return res, 200

    if request.method == "GET":
        decoded_jwt = get_user(request)

        if decoded_jwt == 'Access token is missing or invalid':
            log_app_transaction('AUTH', 'Access token is missing or invalid', 'User Login Page', request.method)
            return "No User Logged In", 404
        else:
            return decoded_jwt, 200

    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        #check whether all the data was passed in properly
        if username == None or password == None:
            log_app_transaction('AUTH', 'Failed Request', 'User Login Page', request.method)
            return "Failed Request", 404

        sql = 'SELECT * FROM accounts WHERE username=\'' + username + '\' AND password=\'' + password + '\''
        test = app.config['DB_CONN'].execute(sql).fetchall()
        #Add form input cases

        if len(test) != 0:
            epoch_time = int(time.time()) + 3600   #gets the epoch time in UTC this is used as an expiration for JWT and add an hour
            payload = {'username' : test[0][0], 'email' : test[0][1], 'exp': epoch_time}
            token = jwt.encode(payload, app.config['SECRET'], algorithm='HS256')
            res = make_response()
            res.set_cookie("OBS_COOKIE", value=token, httponly=True)

            log_app_transaction('AUTH', 'User Logged In Successfully', 'User Login Page', request.method)
            return res, 200
        else:
            log_app_transaction('AUTH', 'Invalid User Credentials', 'User Login Page', request.method)
            return "Invalid User Credentials", 400

@app.route('/dashboard')
def dashboard():
    return render_template("dashboard.html")

@app.route('/welcome')
def welcome():
    return render_template("obs_home.html")

######## END USER ROUTES ########

if __name__ == "__main__" :

    app.run(debug=True)
