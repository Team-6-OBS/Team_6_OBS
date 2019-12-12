import main as mainapp
import sys
import pytest
import sqlalchemy as db
import pymysql
from pytest import *
from _pytest.monkeypatch import MonkeyPatch
import builtins
import jwt, requests
import json
import time
import os

#engine = db.create_engine(os.getenv('DB_CONN_STRING'), pool_pre_ping=True)
#conn = engine.connect()

#sql_delete = 'delete from accounts where username = \'main_test_user\''
#sql_query = 'SELECT uid, username, email FROM accounts WHERE email=\'main_test@email.com\''

@pytest.fixture
def client(request):

    client = mainapp.app.test_client()
    yield client

    def teardown():
        pass # databases and resourses have to be freed at the end. But so far we don't have anything

    request.addfinalizer(teardown)

#Unit
def test_user_login(client):
	atmpt = client.post('/signup', data=dict(username ='main_test_user', password ='main_test_pwd', email = 'main_test@email.com'))
	assert "Email address already in use" != atmpt.data.decode('utf-8') #confirms succesful completion of signup
#	qres = conn.execute(sql_query).fetchall()
#	qresl = len(qres)
#	assert qresl == 1 #Make sure exactly 1 user was returned

	latmpt = client.post('/login', data=dict(username ='123', password ='123'))
	assert "Invalid User Credentials" == latmpt.data.decode('utf-8') #confirms the denial of invalid users

	resp = client.post('/login', data=dict(username ='main_test_user', password ='main_test_pwd'))
	assert "Invalid User Credentials" != resp.data.decode('utf-8') #To make sure a valid user isn't denied

#	conn.execute(sql_delete)

#Unit
def test_authenticate():
    token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJlbWFpbCI6InRlc3RAZW1haWwuY29tIn0.CrMEbpHlgJaqcbqiSID8R1VrH-Aiov1KbcqV628CN_I'
    result = mainapp.authenticate(token)
    assert result['username'] == 'test'
    assert result['email'] == 'test@email.com'
    assert mainapp.authenticate('nope') == 'Access token is missing or invalid'

#Unit
def test_get_delayed_price():
    assert 0.0 == mainapp.get_delayed_price('BLAH')
    assert 0.0 != mainapp.get_delayed_price('SGAMY')

#Unit
def test_form_buy_sell_response():
    buy_test = "{'TransactionType': 'BUY', 'User': 'Ben', "
    buy_test += "'Account': 'test', 'Price': " + str(4.0) + ', '
    buy_test += "'Quantity': " + str(5) + ", 'CostToUser': " + str(20.0) + '}'

    sell_test = "{'TransactionType': 'SELL', 'User': 'Ben', "
    sell_test += "'Account': 'test', 'Price': " + str(4.0) + ', '
    sell_test += "'Quantity': " + str(5) + ", 'PaymentToUser': " + str(20.0) + '}'

    assert buy_test == str(mainapp.form_buy_sell_response('BUY', 'Ben', 'test', 4.0, 5))
    assert sell_test == str(mainapp.form_buy_sell_response('SELL', 'Ben', 'test', 4.0, 5))
