import main as mainapp
import pytest
from pytest import *
import jwt, requests
import json
import os

config = {}
config['SECRET'] = os.getenv('SECRET')

@pytest.fixture
def client(request):
    client = mainapp.app.test_client()
    yield client

    def teardown():
        pass # databases and resourses have to be freed at the end. But so far we don't have anything

    request.addfinalizer(teardown)

#this test will check if the first buy is from the OBS with quantity 5000
def test_obs_buys5000():
    stocks = ['DIS', 'NTDOY', 'ATVI', 'SGAMY', 'UBSFY']
    sql_ins = 'INSERT INTO buy_sell (b_type,username,price,t_account,stocktype,quantity) VALUES'
    for stock in stocks:
        price = mainapp.get_delayed_price(stock);
        sql_ins += '(\'BUY\',\'admin\',' + str(price) + ',\'Bank Stock Inventory\',\'' + stock + '\',5000),'
    sql_ins -= ','

    sql_delete = 'drop table buy_sell'

    sql_table = 'create table buy_sell( '
    sql_table += 'buy_sellid int auto_increment primary key, '
    sql_table +=  'b_type varchar(45), '
    sql_table +=  'username varchar(240), '
    sql_table +=  'price float, '
    sql_table +=  't_account varchar(240), '
    sql_table +=  'stocktype varchar(240), '
    sql_table +=  'quantity int);'

    #reset the table starting with a buy of 5000
    mainapp.query_db(sql_delete)
    mainapp.query_db(sql_table)
    mainapp.query_db(sql_ins)

    #Check that the OBS begins with 5000 of each stock type in its inventory
    
    for stock in stocks:
        test_query = 'SELECT * FROM buy_sell WHERE username = \'admin\' AND stocktype =\'' + stock + '\''
        ret = mainapp.query_db(test_query);

        assert 'BUY' == str(ret[0][1])
        assert 'admin' == str(ret[0][2])
        assert stock == str(ret[0][5])
        assert 5000 == int(ret[0][6])

#Unit Test
def test_authentication():
    pass_test_token = jwt.encode({'username' : 'my_test', 'email' : 'test@py.com'},  config['SECRET'], algorithm='HS256')
    test_pass_user_data = mainapp.authenticate(pass_test_token)

    assert test_pass_user_data == {'username' : 'my_test', 'email' : 'test@py.com'}

    fail_decode_test_token = pass_test_token[1:]
    test_fail_user_data = mainapp.authenticate(fail_decode_test_token)

    assert test_fail_user_data == 'Access token is missing or invalid'

#Acceptance Test
def test_acceptance_save_to_db():
    stocks = ['DIS', 'NTDOY', 'ATVI', 'SGAMY', 'UBSFY']

    b_type = 'BUY'
    name = 'my_test'
    acc = 'test@py.com'
    price = '140.0'
    inventory = 5000
    user_inv = 100

    for stock in stocks:
        amt = 20
        assert mainapp.save_to_db(b_type, name, acc, price, amt, inventory, user_inv, stock) == 'Bought from stock inventory'

        amt = 50
        inventory = 40
        assert mainapp.save_to_db(b_type, name, acc, price, amt, inventory, user_inv, stock) == 'Stock inventory overdrawn, inventory bought needed amt plus 100 and completed the buy'

        amt = 0
        assert mainapp.save_to_db(b_type, name, acc, price, amt, inventory, user_inv, stock) == 'Invalid order amount or quoted price'

#Unit Test
def test_get_delayed_price():

    assert type(mainapp.get_delayed_price()) == type(1.0)

#Acceptance Test
def test_acceptance_buy_sell(client):

    pass_test_token = jwt.encode({'username' : 'my_test', 'email' : 'test@py.com'},  config['SECRET'], algorithm='HS256')
    quantity = 50
    req_data = {'Content-Type' : 'application/json', 'quantity' : quantity, 'account' : 'test_account'}

    res = client.post('/api/buy', data=json.dumps(req_data), cookiejar = {'OBS_COOKIE' : pass_test_token})
    assert 'BUY' in res.data.decode('utf-8')

    res = client.post('/api/sell', data=json.dumps(req_data), cookiejar = {'OBS_COOKIE' : pass_test_token})
    assert 'SELL' in res.data.decode('utf-8')

#Acceptance Test
def test_acceptance_json(client):

    pass_test_token = jwt.encode({'username' : 'my_test', 'email' : 'test@py.com'},  config['SECRET'], algorithm='HS256')
    quantity = 50

    res = client.get('/api/quotes', cookiejar = {'OBS_COOKIE' : pass_test_token})
    assert type(json.loads(res.data.decode('utf-8'))) == type(json.loads("{\"dummy\" : \"object\"}"))

def test_acceptance_transactions(client):

    pass_test_token = jwt.encode({'username' : 'admin', 'email' : 'admin@obs.com'},  config['SECRET'], algorithm='HS256')

    res = client.get('api/transactions', cookiejar = {'OBS_COOKIE' : pass_test_token})
    assert 'BUY' and 'SELL' in res.data.decode('utf-8')
    assert len(json.loads(res.data.decode('utf-8'))['transactions']) > 0

    unauthorized_test_token = jwt.encode({'username' : 'my_test', 'email' : 'test@py.com'},  config['SECRET'], algorithm='HS256')

    res = client.get('api/transactions', cookiejar = {'OBS_COOKIE' : unauthorized_test_token})
    assert res.data.decode('utf-8') == 'Only the admin may view transactions'

    failed_test_token = jwt.encode({'username' : 'my_test', 'email' : 'test@py.com'},  config['SECRET'], algorithm='HS256')
    failed_test_token = failed_test_token[1:]

    res = client.get('api/transactions', cookiejar = {'OBS_COOKIE' : failed_test_token})
    assert res.data.decode('utf-8') == 'Access token is missing or invalid'
