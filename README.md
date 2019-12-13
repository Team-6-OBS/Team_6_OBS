# Team_6_OBS

To run:

1. Install Python 3.7.4 --> https://www.python.org/downloads/release/python-374/
   Install NodeJS https://nodejs.org/dist/v12.13.0/node-v12.13.0-x64.msi

2. After cloning the repository, navigate to its location on your local machine and run the following commands...

pip install -r requirements.txt

npm install

... to install the required packages to run this project

3. Finally, input the following command to run the app locally...

npm start

ADMIN INFORMATION: Will give access to transaction logs and OBS Profit and Loss
username: admin
password: adminpass

Otherwise create an account for yourself
Tokens last for an hour before expiring

4. How would we implement rollback?

Rollback on travis ci could be accomplished by running a saved build again. Since Travis CI hold previous build information
it would be simple to navigate to the most recent successful build and rerun it. This would cause it to complete once again,
and with proper auto deployment setup would cause it to push that version to google cloud app engine. YOu can choose to have
this auto deploy to not override the other instances. If it does however it could entirely switch a new deployent back to the
older version.

5. Links

github repo: https://github.com/Team-6-OBS/Team_6_OBS
CI Server: https://travis-ci.com/Team-6-OBS/Team_6_OBS
***You will need to view the repo on your travis ci dashboard, a member of the repo should have access to view it
Swagger Hub: https://app.swaggerhub.com/apis/OBS_Team6/OBS_Team6_API/1.0#/
google cloud: https://obsmainservice.appspot.com
lint tool: https://www.pylint.org

6. Overview

For this project the database we used was MySQL. This allowed us to use sql procedures to simplify certain tasks,
like logging. Back end that we used to query the database was python 3.7.4 with flask. Flask helped us set us a simple
request response driven web server. Most Endpoints served to receive data and insert it into the database to formulate
a response containing either queried data or a confirmation that an update was successful. This confimation was then 
sent to our React frontend. React was used to create the view and make async axios requests to communicate with our backend.

We decided to use the google cloud app engine for deployment because we found that it was very easy to quickly deploy
python web applications. It was also the most common google cloud deployment tool used with out CI server: travis ci
so it gave us the most information on how to manage automated deployment. With travis CI we were able to run many
jobs in stages, but each job within a stage could be run in parallel to save time runnin multiple types of tests at
once in the same stage as opposed to different stages. Our source code management tool was github and we linked that to
travis ci to automate build on a push to master. Our authentication tool was a simple JWT token that was attached to an
http only cookie on the browser that we check to determine user idenetity throught multiple requests.
