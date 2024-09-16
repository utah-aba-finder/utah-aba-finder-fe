describe('login page tests', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000/login')
    })
    it('should have a main header', () => {
      cy.get('.loginImageText').should('contain', 'Provider Login')
    })
    it('should have a user icon', () => {
      cy.get('.userIcon').should('exist')
    })
    it('should have a password icon', () => {
      cy.get('.lockIcon').should('exist')
    })
    it('should have a password input', () => {
      cy.get('#password').should('exist')
    })
    it('should have a username input', () => {
      cy.get('#username').should('exist')
    })
    it('should have a submit button', () => {
      cy.get('.loginButton').should('exist')
    })
    it('should have a sign up button for no existent users', () => {
      cy.get('.loginButton').should('exist')
    })
    it('should have a forgot password link', () => {
      cy.get('.forgot-password').should('exist')
    })
    it('should have a eye button to show password', () => {
      cy.get('.eyeButton').should('exist')
    })
    it('should have a eye icon', () => {
      cy.get('.eye').should('exist')
    })
    it('should require a username and password', () => {
      cy.get('#login').should('be.enabled')
      .click()
      cy.get('#username').should('have.attr', 'required');
  
      cy.get('#password').should('have.attr', 'required');
    })
    it('should show password when eye button is clicked', () => {
      cy.get('.eyeButton').click()
      cy.get('#password').should('have.attr', 'type', 'text')
    })
    it('should redirect to signup page when sign up button is clicked', () => {
      cy.get('#signup').click()
      cy.url().should('include', '/signup')
    })
    it.skip('should redirect to forgot password page when forgot password link is clicked', () => {
      cy.get('.forgot-password').click()
      cy.url().should('include', '/forgot-password')
    })
    it.skip('should throw an error when the user does not exist', () => {
      cy.get('#username').type('user')
      cy.get('#password').type('password')
      cy.get('#login').click()
      cy.get('.error').should('exist')
    })
    it.skip('should redirect to providers info page when login is successful', () => {
      cy.get('#username').type('user')
      cy.get('#password').type('password')
      cy.get('#login').click()
      cy.url().should('include', '/user:id')
    })
  })