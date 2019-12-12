let newUser = makeid(12)
let newEmail = makeid(5) + '@gmail.com' 

describe('View Tests without credentials', function () {//3. Non-authed users cannot view a dashboard or engage stock transactions 
    it('Goes to the main web address without authenitcation and is unable to got to /dashboard', function () {
        cy.visit('http://localhost:5000/')

        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(0)
        //cy.contains('.mr-sm-2 username-login')
        //cy.get('.mr-sm-2 username-login').should('be.visible')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(1)
        //cy.contains('.mr-sm-2 pass-login')
        //cy.get('mr-sm-2 pass-login').should('be.visible')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(2)
        //cy.contains('.btn.btn-outline-success.mr-sm-2.button-login')
        //cy.get('.btn btn-outline-success mr-sm-2 button-login').should('be.visible')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(3)
        //cy.contains('.fasdf')
        //cy.get('.fasdf').should('be.visible')

        cy.get('.nav-link').contains('Dashboard').should('not.exist')

        cy.get('text-light').should('not.exist')
        cy.get('li').contains('Welcome')
    })
    it('Goes to dashboard without logging in and is unable to view user dashboard', function () {
        cy.visit('http://localhost:5000/dashboard')

        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(0)
        //cy.contains('.mr-sm-2 username-login')
        //cy.get('.mr-sm-2 username-login').should('be.visible')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(1)
        //cy.contains('.mr-sm-2 pass-login')
        //cy.get('.mr-sm-2 pass-login').should('be.visible')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(2)
        //cy.contains('.btn btn-outline-success mr-sm-2 button-login')
        //cy.get('.btn btn-outline-success mr-sm-2 button-login').should('be.visible')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(3)
        //cy.contains('.fasdf')
        //cy.get('.fasdf').should('be.visible')

        cy.get('.nav-link').contains('Dashboard').should('not.exist')

        cy.get('.text-light').should('not.exist')

        cy.get('.container-fluid').should('not.exist')
    })
})
describe('Signup Tests with Login Assertion', function () {//1. New clients can register to access OBS
    it('Fails to Create a New User due to Password Length Error', function () {
        cy.visit('http://localhost:5000/signup')

        cy.get('.username-signup')
            .type('new_fail_test_user')
            .should('have.value', 'new_fail_test_user')

        cy.get('.email-signup')
            .type('test2@here.com')
            .should('have.value', 'test2@here.com')

        cy.get('.pass-signup')
            .type('short')
            .should('have.value', 'short')

        cy.get('.passConfirm-signup')
            .type('short')
            .should('have.value', 'short')

        cy.get('.button-signup').click()

        cy.on('window:alert', (str) => {
            expect(str).to.equal('Password must be 8 characters minimum.')
        })
    })
    it('Visits the Registration Page and Successfully Creates a New User', function() {
      cy.visit('http://localhost:5000/signup')

      cy.get('.username-signup')
      .type(newUser)
      .should('have.value', newUser)

      cy.get('.email-signup')
      .type(newEmail)
      .should('have.value', newEmail)

      cy.get('.pass-signup')
      .type('long_password')
      .should('have.value', 'long_password')

      cy.get('.passConfirm-signup')
      .type('long_password')
      .should('have.value', 'long_password')

      cy.get('.button-signup').click()

      cy.on('window:alert', (str) => {
        expect(str).to.equal('Account Created!')
      })
    })
})
describe('Login Authentication Test', function () {//5. Clients must input valid username/password combination or given an error message when logging in 
    it('Logs in with bad credentials and gets a message', function () {
        cy.visit('http://localhost:5000')

        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(0).type('new_fail_test_user').should('have.value', 'new_fail_test_user')
        //cy.get('.mr-sm-2 username-login')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(1).type('short').should('have.value', 'short')
        //cy.get('.mr-sm-2 pass-login')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(2).click()
        //cy.get('.btn btn-outline-success mr-sm-2 button-login')

        cy.on('window:alert', (str) => {
            expect(str).to.equal('Invalid Username/Password Combo')
        })
        cy.wait(7000)
    })
    it('Logs in with valid credentials from /dashboard and page reflects appropriate elements to an authed user', function () {
        cy.visit('http://localhost:5000')

        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(0).type(newUser).should('have.value', newUser)
        //cy.get('.mr-sm-2 username-login')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(1).type('long_password').should('have.value', 'long_password')
        //cy.get('mr-sm-2 pass-login')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(2).click()
        //cy.get('.btn btn-outline-success mr-sm-2 button-login')

        cy.wait(7000)
        cy.visit('http://localhost:5000/dashboard')
        cy.wait(7000)

        cy.get('.nav-link').eq(1).contains('Dashboard')

        cy.get('.text-light').contains(newUser)

        cy.get('.container-fluid')

        cy.get('button').contains('Create New Table').parent().children()
        
        
        //cy.get('.container-fluid').children().eq(0).children.eq(0).children()
        //cy.get('.btn btn-primary')
    })
})
describe('Dashboard view Test', function () {//2. Authed users can view their OBS dashboard 
    it('Logged in user with valid credentials views user dashboard', function () {
        cy.visit('http://localhost:5000/')

        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(0).type(newUser).should('have.value', newUser)
        //cy.get('.mr-sm-2 username-login')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(1).type('long_password').should('have.value', 'long_password')
        //cy.get('mr-sm-2 pass-login')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(2).click()

        cy.wait(7000)
        cy.visit('http://localhost:5000/dashboard')
        cy.wait(7000)

        cy.get('.nav-link').eq(1).contains('Dashboard')

        cy.get('.text-light').contains(newUser)

        cy.get('.container-fluid')

        cy.get('button').contains('Create New Table')

        //cy.get('.btn btn-primary')
  
    })
})
describe('User Account Creation Test', function () {//7. Authed user can create multiple accounts 
    it('Clicks first create account button (1 out of 3) and is now able to see a table for Account1', function () {
        
        cy.visit('http://localhost:5000/')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(0).type(newUser).should('have.value', newUser)
        //cy.get('.mr-sm-2 username-login')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(1).type('long_password').should('have.value', 'long_password')
        //cy.get('mr-sm-2 pass-login')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(2).click()
        //cy.get('.btn btn-outline-success mr-sm-2 button-login')

        cy.wait(7000)
        cy.visit('http://localhost:5000/dashboard')
        cy.wait(7000)

        cy.get('.container-fluid').children().eq(0).children().eq(0).children().eq(0).should('have.text', 'Create New Table') //Button1 
        cy.get('.container-fluid').children().eq(1).children().eq(0).children().eq(0).should('have.text', 'Create New Table') //Button2
        cy.get('.container-fluid').children().eq(2).children().eq(0).children().eq(0).should('have.text', 'Create New Table') //Button2

        cy.window().then(win => {
            cy.stub(win, 'prompt').returns('Account1')
            cy.get('.container-fluid').children().eq(0).children().eq(0).children().eq(0).click() //Button1 
            //cy.get('.btn btn-primary')
            //... Saved value assert 
        })
        cy.wait(7000)
        cy.get('button').contains('Create New Table').click();
        cy.get('thead').find('tr').eq(0).children().contains('Account1')
        cy.get('.ntdoy')
        cy.get('.sgamy')
        cy.get('.atvi')
        cy.get('.dis')
        cy.get('.ubsfy')
    })
})
describe('Dashboard table view tests', function () {//4. OBS dashboard displays current stock prices for Bank Inc stocks with client portfolio information 
    it('Has table a table with stock and client information', function () {

      cy.visit('http://localhost:5000/')
      cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(0).type(newUser).should('have.value', newUser)
      //cy.get('.mr-sm-2 username-login')
      cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(1).type('long_password').should('have.value', 'long_password')
      //cy.get('mr-sm-2 pass-login')
      cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(2).click()
      //cy.get('.btn btn-outline-success mr-sm-2 button-login')

      cy.wait(7000)
      cy.visit('http://localhost:5000/dashboard')
      cy.wait(7000)

      cy.get('thead').find('tr').children().contains('Account1') //cy.get('.table table-striped').contains('Account1')
      cy.get('thead').find('tr').children().contains('0')

      cy.get('.ntdoy').children().eq(0).should('have.text', 'NTDOY')
      cy.get('.ntdoy').children().eq(1).should('have.text', '0')
      cy.get('.ntdoy').children().eq(2).should('not.have.text', '0')
      cy.get('.ntdoy').children().eq(3).should('have.text', '0.00')

      cy.get('.sgamy').children().eq(0).should('have.text', 'SGAMY')
      cy.get('.sgamy').children().eq(1).should('have.text', '0')
      cy.get('.sgamy').children().eq(2).should('not.have.text', '0')
      cy.get('.sgamy').children().eq(3).should('have.text', '0.00')

      cy.get('.atvi').children().eq(0).should('have.text', 'ATVI')
      cy.get('.atvi').children().eq(1).should('have.text', '0')
      cy.get('.atvi').children().eq(2).should('not.have.text', '0')
      cy.get('.atvi').children().eq(3).should('have.text', '0.00')

      cy.get('.dis').children().eq(0).should('have.text', 'DIS')
      cy.get('.dis').children().eq(1).should('have.text', '0')
      cy.get('.dis').children().eq(2).should('not.have.text', '0')
      cy.get('.dis').children().eq(3).should('have.text', '0.00')

      cy.get('.ubsfy').children().eq(0).should('have.text', 'UBSFY')
      cy.get('.ubsfy').children().eq(1).should('have.text', '0')
      cy.get('.ubsfy').children().eq(2).should('not.have.text', '0')
      cy.get('.ubsfy').children().eq(3).should('have.text', '0.00')

    })
})
describe('Add Funds functional test', function () {//8. Authed user can add funds to an account 
    it('adds funds to a specified account', function () {
        cy.visit('http://localhost:5000/')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(0).type(newUser).should('have.value', newUser)
        //cy.get('.mr-sm-2 username-login')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(1).type('long_password').should('have.value', 'long_password')
        //cy.get('mr-sm-2 pass-login')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(2).click()
        //cy.get('.btn btn-outline-success mr-sm-2 button-login')

        cy.wait(7000)
        cy.visit('http://localhost:5000/dashboard')
        cy.wait(7000)

        cy.window().then(win => {
            cy.stub(win, 'prompt').returns('2')
            cy.get('.container-fluid').children().eq(0).contains('Add').click()//cy.get('.container-fluid').children().eq(0).children().eq(0).children().eq(0).children().eq(0).children().eq(0).children().eq(2).children().eq(0).click(); //Button1 
            //... Saved value assert
        })
        cy.wait(7000)
        cy.get('thead').find('tr').children().contains('2')
    })
    it('does not put through a negative value/invalid input', function () {

        cy.window().then(win => {
            cy.stub(win, 'prompt').returns('-2')
            cy.get('.container-fluid').children().eq(0).contains('Add').click()
            //... Saved value assert
        })
        
        cy.get('thead').find('tr').children().contains('2')
    })
})
describe('Share purchase functional correctness test', function () {//6. Authed user cannot purchase shares at a cost greater than the cash held in the account 
    it('Attempts to buy while having almost no money and fails', function () {
        cy.visit('http://localhost:5000/')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(0).type(newUser).should('have.value', newUser)
        //cy.get('.mr-sm-2 username-login')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(1).type('long_password').should('have.value', 'long_password')
        //cy.get('mr-sm-2 pass-login')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(2).click()
        //cy.get('.btn btn-outline-success mr-sm-2 button-login')

        cy.wait(7000)
        cy.visit('http://localhost:5000/dashboard')
        cy.wait(7000)

        cy.window().then(win => {
            cy.stub(win, 'prompt').returns('100')
            cy.get('.ntdoy').children().eq(4).children().eq(0).click();
            //... Saved value assert
        })
        cy.on('window:alert', (str) => {
            expect(str).to.equal('An error occured. Please check that you have enough money in your account to make this purchase.')
        })
    })
})
describe('Stock Buy/Sell functional tests', function () {//10. Authed users can purchase shares and sell existing shares
    it('Buys and Sells stock successfully and is reflected in the table ', function () {
        cy.visit('http://localhost:5000')

        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(0).type(newUser).should('have.value', newUser)
        //cy.get('.mr-sm-2 username-login')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(1).type('long_password').should('have.value', 'long_password')
        //cy.get('mr-sm-2 pass-login')
        cy.get('body').children().eq(0).children().eq(0).children().eq(0).children().eq(1).children().eq(2).click()
        //cy.get('.btn btn-outline-success mr-sm-2 button-login')

        cy.wait(7000)
        cy.visit('http://localhost:5000/dashboard')
        cy.wait(7000)

        cy.window().then(win => {
            cy.stub(win, 'prompt').returns('4998')
            cy.get('.container-fluid').children().eq(0).contains('Add').click()
            cy.wait(7000)
            cy.stub(win, 'prompt').returns('2')
            cy.get('.container-fluid').contains('.ntdoy').contains('Buy').click(); 
            cy.wait(7000)
            cy.stub(win, 'prompt').returns('1')
            cy.get('.container-fluid').contains('.ntdoy').contains('Sell').click();
            //... Saved value assert
        })
       cy.wait(7000)
        cy.get('.ntdoy').children().eq(1).should('have.text', '2')
        cy.get('.ntdoy').children().eq(1).should('have.text', '1')
        /*cy.window().then(win => {
            cy.stub(win, 'prompt').returns('2')
            cy.get('.container-fluid').contains('.ntdoy').contains('Buy').click();     
            //... Saved value assert
        })
        
        
       

        cy.window().then(win => {

            //... Saved value assert
        })*/
 
 
    })
    it('Invalid input does not get put through', function () {
        cy.visit('http://localhost:5000/dashboard')
        cy.wait(7000)

        cy.window().then(win => {
            cy.stub(win, 'prompt').returns('-1')
            cy.get('.container-fluid').contains('.ntdoy').contains('Buy').click();
            //... Saved value assert
        })
        cy.wait(7000)
        cy.get('.ntdoy').children().eq(1).should('have.text', '1')
    })
})

/*describe('View test over multiple account tables', function () {//9. OBS maintains separate cash and stock holdings purchased per account  
    it('Between the two tables of accounts different funds and stock amounts are found', function () {
        cy.window().then(win => {
            cy.stub(win, 'prompt').returns('Account2')
            cy.get('.btn btn-primary').eq(1).click();
            //... Saved value assert
        })
        cy.get('thead').eq(1).find('tr').eq(0).children().contains('Account2')
        cy.get('thead').eq(1).find('tr').eq(0).children().eq(1).should('have.text', '0')
        cy.get('thead').eq(0).find('tr').eq(0).children().contains('Account1')
        cy.get('thead').eq(0).find('tr').eq(0).children().eq(1).should('not.have.text', '0')
    })
})
describe('Number of Accounts possible tests', function () {//11. Authed users are not permitted to open more that 3 accounts 
    it('In creating three tables/accounts a button to create another should not exist', function () {
        cy.window().then(win => {
            cy.stub(win, 'prompt').returns('Account3')
            cy.get('.btn btn-primary').eq(3).click();
            //... Saved value assert
        })
        cy.get('thead').should('have.length', 3)
        cy.get('.btn btn-primary').contains('Create New Table').should('not.exist')
    })
})*/
function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'; //0123456789
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}