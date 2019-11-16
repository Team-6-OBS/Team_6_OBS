import main as mainapp
import pytest
from pytest import *
from _pytest.monkeypatch import MonkeyPatch
import builtins
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


def test_authentication():
    pass_test_token = jwt.encode({'username' : 'my_test', 'email' : 'test@py.com'},  config['SECRET'], algorithm='HS256')
    test_pass_user_data = mainapp.authenticate(pass_test_token)

    assert test_pass_user_data == {'username' : 'my_test', 'email' : 'test@py.com'}

    fail_decode_test_token = pass_test_token[1:]
    test_fail_user_data = mainapp.authenticate(fail_decode_test_token)

    assert test_fail_user_data == 'Access token is missing or invalid'

def test_acceptance_save_to_db():

    b_type = 'BUY'
    name = 'my_test'
    acc = 'test@py.com'
    price = '140.0'
    amt = 20
    inventory = 5000
    assert mainapp.save_to_db(b_type, name, acc, price, amt, inventory) == 'Bought from stock inventory'

    amt = 50
    inventory = 40
    assert mainapp.save_to_db(b_type, name, acc, price, amt, inventory) == 'Stock inventory overdrawn, inventory bought needed amt plus 100 and completed the buy'

    amt = 0
    assert mainapp.save_to_db(b_type, name, acc, price, amt, inventory) == 'Invalid order amount or quoted price'

def test_get_delayed_price():

    assert type(mainapp.get_delayed_price()) == type(1.0)

def test_acceptance_buy_sell(client):

    pass_test_token = jwt.encode({'username' : 'my_test', 'email' : 'test@py.com'},  config['SECRET'], algorithm='HS256')
    quantity = 50

    res = client.post('/api/buy', headers={'Content-Type' : 'application/json', 'auth' : pass_test_token, 'quantity' : quantity, 'account' : 'test_account'})
    assert 'BUY' in res.data.decode('utf-8')

    res = client.post('/api/sell', headers={'Content-Type' : 'application/json', 'auth' : pass_test_token, 'quantity' : quantity, 'account' : 'test_account'})
    assert 'SELL' in res.data.decode('utf-8')

def test_acceptance_json(client):

    pass_test_token = jwt.encode({'username' : 'my_test', 'email' : 'test@py.com'},  config['SECRET'], algorithm='HS256')
    quantity = 50

    res = client.get('/api/quotes', headers={'Content-Type' : 'application/json', 'auth' : pass_test_token})
    assert type(json.loads(res.data.decode('utf-8'))) == type(json.loads("{\"dummy\" : \"object\"}"))

def test_acceptance_transactions(client):

    pass_test_token = jwt.encode({'username' : 'admin', 'email' : 'admin@obs.com'},  config['SECRET'], algorithm='HS256')

    res = client.get('api/transactions', headers={'Content-Type' : 'application/json', 'auth' : pass_test_token})
    assert 'BUY' and 'SELL' in res.data.decode('utf-8')
    assert len(json.loads(res.data.decode('utf-8'))['transactions']) > 0

    unauthorized_test_token = jwt.encode({'username' : 'my_test', 'email' : 'test@py.com'},  config['SECRET'], algorithm='HS256')

    res = client.get('api/transactions', headers={'Content-Type' : 'application/json', 'auth' : unauthorized_test_token})
    assert res.data.decode('utf-8') == 'Only the admin may view transactions'

    failed_test_token = jwt.encode({'username' : 'my_test', 'email' : 'test@py.com'},  config['SECRET'], algorithm='HS256')
    failed_test_token = failed_test_token[1:]

    res = client.get('api/transactions', headers={'Content-Type' : 'application/json', 'auth' : failed_test_token})
    assert res.data.decode('utf-8') == 'Access token is missing or invalid'
