# Team_6_OBS

To run:

1. Install Python 3.7.4 --> https://www.python.org/downloads/release/python-374/

2. After cloning the repository, navigate to its location on your local machine and run the following commands...

pip install -r requirements.txt

npm install

... to install the required packages to run this project

3. Finally, input the following command to run the app locally...

python main.py

admin account: Will give access to buy/sell logs
username: admin
password: password

Otherwise create an account for yourself

You can see the token in a dropdown menu after a successful login
and copy paste by viewing the post request response to /login

Tokens last for an hour before expiring

4. To run microservices locally use the following command

python micro/adam/main.py - Nintendo Stock
python micro/michael/main.py - Disney Stock
python micro/ben/main.py - Sega Stock
python micro/carlos/main.py - Activision/Blizzard Stock
python micro/sean/main.py - xx Stock

5. To interact with microservices use this API

https://app.swaggerhub.com/apis/OBS_Team6/OBS_Team6_API/1.0#/

6. Google Cloud Links:
https://obsmicroservice.appspot.com   -Signup and Login