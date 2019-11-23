describe('Signup Tests with Login Assertion', function() {
    it('Visits the Registration Page and Successfully Creates a New User', function() {
      cy.visit('http://localhost:5000/signup')

      cy.get('.username-signup')
      .type('new_pass_test_user')
      .should('have.value', 'new_pass_test_user')

      cy.get('.email-signup')
      .type('test1@here.com')
      .should('have.value', 'test1@here.com')

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
    it('Fails to Create a New User due to Password Length Error', function() {
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
  })