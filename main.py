from flask import Flask, render_template, Blueprint, request, make_response
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

@app.route('/')
def home():
    return render_template("obs_navigation.html")

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
            return 'Successfully Created Account', 200
        else:
            return "Email address or username already in use", 400

@app.route('/login', methods=["GET", "POST"])
def login():
    if request.method == "GET":
        cookie = request.cookies.get('OBS_COOKIE')
        if cookie == None:
            return "No User Logged In", 404
        else:
            decoded_jwt = authenticate(cookie)
            if decoded_jwt == 'Access token is missing or invalid':
                return "No User Logged In", 404
            else:
                return decoded_jwt, 200

    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        #check whether all the data was passed in properly
        if username == None or password == None:
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
            return res, 200
        else:
            return "Invalid User Credentials", 400

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

@app.route('/add', methods=["POST"])
def add_funds():
    cookie = request.cookies.get('OBS_COOKIE')
    if cookie == None:
        return "No User Logged In", 404
    else:
        decoded_jwt = authenticate(cookie)
        if decoded_jwt == 'Access token is missing or invalid':
            return "No User Logged In", 404

        money_added = request.form.get('money')
        if float(money_added) >= 0:
            acc = request.form.get('account')
            sql = 'SELECT dollars FROM account_totals WHERE username = \'' + decoded_jwt['username'] + '\' AND account = \'' + acc + '\';'

            dollars = app.config['DB_CONN'].execute(sql).fetchall()[0][0]
            new_dollars = round(float(dollars) + float(money_added), 2)

            sql = 'UPDATE account_totals SET dollars = \'' 
            sql = sql + str(new_dollars) + '\' WHERE username = \'' + decoded_jwt['username'] + '\' AND account = \'' + acc + '\';'

            res = app.config['DB_CONN'].execute(sql)
            return 'Funds Sucessfully Added', 200

    return 'Invalid Addition Amount', 500

@app.route('/newacc', methods=["POST"])
def create_account():
    cookie = request.cookies.get('OBS_COOKIE')
    if cookie == None:
        return "No User Logged In", 404
    else:
        decoded_jwt = authenticate(cookie)
        if decoded_jwt == 'Access token is missing or invalid':
            return "No User Logged In", 404

        acc_name = request.form.get('account')
        
        sql = 'SELECT account from account_totals WHERE username = \'' + decoded_jwt['username'] + '\';'
        current_accounts = app.config['DB_CONN'].execute(sql).fetchall()

        exists = False
        for acc in current_accounts:
            if acc_name == acc[0]:
                exists = True
        
        if not exists:
            sql = 'INSERT INTO account_totals(account, username) VALUES(\'' + acc_name +  '\', \'' + decoded_jwt['username'] + '\');'
            app.config['DB_CONN'].execute(sql)

            return 'Account Added Successfully', 200

        return 'Account Already Exists', 500


@app.route('/dashboard')
def dashboard():
    return render_template("dashboard.html")

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

@app.route('/welcome')
def welcome():
    return render_template("obs_home.html")

if __name__ == "__main__" :

    app.run(debug=True)
