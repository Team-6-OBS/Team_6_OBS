import main as mainapp
import pytest
from pytest import *
import jwt, requests
import json
import os

@pytest.fixture
def client(request):
    client = mainapp.app.test_client()
    yield client

    def teardown():
        pass # databases and resourses have to be freed at the end. But so far we don't have anything

    request.addfinalizer(teardown)

#Unit Test
def test_authentication():
    pass_test_token = jwt.encode({'username' : 'my_test', 'email' : 'test@py.com'},  os.getenv('SECRET'), algorithm='HS256')
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
    acc = 'Savings Account'
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

    update_test_account = 'UPDATE account_totals SET dollars = 10000, dis_stock = 0, ntdoy_stock = 0, sgamy_stock = 0, atvi_stock = 0, ubsfy_stock = 0 WHERE username = \'my_test\' AND account = \'Savings Account\';'
    mainapp.query_db(update_test_account)

#Unit Test
def test_get_delayed_price():
    stocks = ['DIS', 'NTDOY', 'ATVI', 'SGAMY', 'UBSFY']

    for stock in stocks:
        res = mainapp.get_delayed_price(stock)
        assert type(res) == type(1.0)

'''
#Acceptance Test
def test_acceptance_buy_sell(client):
    stocks = ['DIS', 'NTDOY', 'ATVI', 'SGAMY', 'UBSFY']

    pass_test_token = jwt.encode({'username' : 'my_test', 'email' : 'test@py.com'},  os.getenv('SECRET'), algorithm='HS256')
    quantity = 50

    for stock in stocks:
        req_data = {'quantity' : quantity, 'account' : 'Savings Account', 'symbol' : stock}
        print(req_data)
        res = client.post('/buy', headers={'Content-Type' : 'application/json', 'auth' : pass_test_token}, json=json.dumps(req_data), content_type = 'application/json')
        assert 'BUY' in res.data.decode('utf-8')

        res = client.post('/sell', headers={'Content-Type' : 'application/json', 'auth' : pass_test_token}, json=json.dumps(req_data), content_type = 'application/json')
        assert 'SELL' in res.data.decode('utf-8')

    update_test_account = 'UPDATE account_totals SET dollars = 10000, dis_stock = 0, ntdoy_stock = 0, sgamy_stock = 0, atvi_stock = 0, ubsfy_stock = 0 WHERE username = \'my_test\' AND account = \'Savings Account\';'
    mainapp.query_db(update_test_account)
'''

#Acceptance Test
def test_acceptance_json(client):

    pass_test_token = jwt.encode({'username' : 'my_test', 'email' : 'test@py.com'},  os.getenv('SECRET'), algorithm='HS256')
    quantity = 50

    res = client.get('/quotes', headers = {'Content-Type' : 'application/json', 'auth' : pass_test_token})
    assert type(json.loads(res.data.decode('utf-8'))) == type(json.loads("{\"dummy\" : \"object\"}"))

#Acceptance Test
def test_acceptance_transactions(client):

    pass_test_token = jwt.encode({'username' : 'admin', 'email' : 'admin@obs.com'},  os.getenv('SECRET'), algorithm='HS256')

    res = client.get('/getlogs', headers = {'Content-Type' : 'application/json', 'auth' : pass_test_token})
    assert len(json.loads(res.data.decode('utf-8'))['logs']) > 0

    unauthorized_test_token = jwt.encode({'username' : 'my_test', 'email' : 'test@py.com'},  os.getenv('SECRET'), algorithm='HS256')

    res = client.get('/getlogs', headers = {'Content-Type' : 'application/json', 'auth' : unauthorized_test_token})
    assert res.data.decode('utf-8') == 'Only the admin may view transactions'