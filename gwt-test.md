Scenario: Bob wants to register to access OBS
Given: Bob has not accessed OBS before AND is not logged in
When: Bob enters credentials for the user account he wants to create
Then:  His credentials are added to the system AND he is logged in AND sent to his dashboard.

Scenario: Authed users can view their OBS dashboard
Given: :  User has already registered AND has a pre-existing OBS account
When: When user enters the valid credentials for their existing user account 
Then: Their credentials are authenticated AND they’re given a token AND they’re sent to their dashboard and have access to perform transactions related to their account

Scenario:Non-authed users cannot view a dashboard or engage stock transactions
Given: User has not registered AND does not have a pre-existing account
When: User attempts to input invalid user credentials on the login page AND logs in
Then: The OBS system rejects the login attempt AND sends an error message notifying the user that they used invalid credentials AND they are not sent to a dashboard AND they are not able to engage in transactions.

Scenario: OBS dashboard displays current stock prices for Bank Inc stocks with client portfolio information 
Given: A user is logged in
When: He views his dashboard
Then: It displays current stock prices with information from the user’s portfolio

Scenario: Clients must input valid username/password combination or given an error message when logging in
Given:  client have a valid username and password already	
When: client inputs username and password and clicks the login button.	
Then:  pop up will come up that says “Wrong Username/password combo”

Scenario:Authed user cannot purchase shares at a cost greater than the cash held in the account
Given: A logged-in user has x amount of cash in their account
When: They try to purchase shares at a cost greater than x
Then: An error message is displayed AND no purchase is made

Scenario: Authed user can create multiple accounts
Given: User is logged in to their account
When: Clicking the ‘create accounts’ button on the dashboard
Then: User may specify an account name and create a new account

Scenario: Authed user can add funds to an account
Given: User has logged in to their account
When: Clicking the ‘add funds’ button
Then: User may add desired amount of funds to their specified account

Scenario: OBS maintains separate cash and stock holdings purchased per account 
Given:   Chris P. Bacon has 2 account each with non zero money and some number of stocks.
When: Bacon buy stocks from  first account that makes their balance in cash 0.
Then:   Bacon 2nd account won't be affected by this and the first account will have 0 money and the stocks increase by the amount they just purchased.

Scenario: Authed users can purchase shares and sell existing shares
Given: User has logged in to their account
When: Navigating to the buy or sell page for their chosen stock symbol
Then: Account may buy or sell shares

Scenario:Authed users are not permitted to open more that 3 accounts
Given:  Authed user has already made 3 different accounts
When: User click button to create a new account .
Then:  windows pops up that says “You can't have more than 3 accounts” 
