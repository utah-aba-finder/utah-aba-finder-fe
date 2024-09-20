describe('provider edit spec', () => {
    beforeEach(() => {
        cy.visit('localhost:3000/providerLogin')
    })

    it('should display the provider edit page', () => {
        cy.get('#username').type('provider61user@example.com')
        cy.get('#password').type('securepassword')
        cy.get('#login').click()
        cy.get('.user-info-section').should('be.visible')
        cy.get('.provider-edit-form').should('be.visible')
        cy.get('.save-button').should('be.visible')
        cy.get('.cancel-button').should('be.visible')
        cy.get('.logoutButton').should('be.visible')
        cy.get('.contact-link').should('be.visible')
    })

})