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

For this project the database we used a google cloud hosted instance of a MySQL database. This allowed us to utilize sql procedures to simplify certain tasks, like logging and . Back end that we used to query the database was python 3.7.4 with flask. Flask helped us set up a simple REST interactions for our web server. Most Endpoints served to receive user requests and manage the database interactions associated with them to formulate a response containing either queried data or a confirmation that an update was successful. These responses interfaced with with our React frontend to create, modify and populate the view. React communicated inversely with our backend by using async axios requests to query data.

We decided to use the google cloud app engine for deployment because we found that it was very easy to quickly deploy
python web applications and had tools that eased managing connections to our database. It was also the most common google cloud deployment tool used with out CI server, travis ci, so it provided us with the most information on how to manage our automated deployment. With travis CI we were able to run many jobs in stages, with each job within a stage able to be run in parallel.  This saved time in our test stages, as we could run the different types of tests in one stage. Our source code management tool was github, which we linked that to travis ci to automate our build upon a push to the master branch. For authentication, we used a simple JWT token that could be attached to an http-only cookie on the browser.  This allowed us to determine the user identity throughtout multiple requests in a user session.
