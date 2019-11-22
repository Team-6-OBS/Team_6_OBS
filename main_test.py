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

engine = db.create_engine(os.getenv('DB_CONN_STRING'), pool_pre_ping=True)
conn = engine.connect()

sql_delete = 'delete from accounts where username = \'main_test_user\''
sql_query = 'SELECT uid, username, email FROM accounts WHERE email=\'main_test@email.com\''

@pytest.fixture
def client(request):

    client = mainapp.app.test_client()
    yield client

    def teardown():
        pass # databases and resourses have to be freed at the end. But so far we don't have anything

    request.addfinalizer(teardown)

def test_user_login(client):
	atmpt = client.post('/signup', data=dict(username ='main_test_user', password ='main_test_pwd', email = 'main_test@email.com'))
	assert "Email address already in use" != atmpt.data.decode('utf-8') #confirms succesful completion of signup
	qres = conn.execute(sql_query).fetchall()
	qresl = len(qres)
	assert qresl == 1 #Make sure exactly 1 user was returned

	latmpt = client.post('/login', data=dict(username ='123', password ='123'))
	assert "Invalid User Credentials" == latmpt.data.decode('utf-8') #confirms the denial of invalid users

	resp = client.post('/login', data=dict(username ='main_test_user', password ='main_test_pwd'))
	assert "Invalid User Credentials" != resp.data.decode('utf-8') #To make sure a valid user isn't denied

	conn.execute(sql_delete)

#authenticate function used to parse token from auth test
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

def test_token_authentication(client):
	atmpt = client.post('/signup', data=dict(username ='main_test_user', password ='main_test_pwd', email = 'main_test@email.com'))
	resp = client.post('/login', data=dict(username ='main_test_user', password ='main_test_pwd'))
	token = resp.data.decode('utf-8')
	autho = authenticate(token) #Send the token to the authentication function of a microservice
	assert {'email': 'main_test@email.com', 'username': 'main_test_user'} == autho #See if the response is username and email of associated user's token

	conn.execute(sql_delete)
	conn.close()
