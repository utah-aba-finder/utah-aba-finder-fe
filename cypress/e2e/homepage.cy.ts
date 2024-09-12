describe('template spec', () => {
  beforeEach(() => {
    cy.visit('localhost:3000')
  })

  it('should display the "Discover" section', () => {
    cy.get('.discover-section-title').should('be.visible')
    cy.get('.discover-section-description').should('be.visible')
    cy.get('.discover-section-button').should('be.visible')
    cy.get('.discover-section-button').click()
    cy.url().should('include', '/providers')
  })

  it('should display the "Counties Covered" section', () => {
    cy.get('.county-section-title').should('be.visible')
    cy.get('.county-section-list').should('be.visible')
  })

  it('should display the "Begin Your Journey" section', () => {
    cy.get('.begin-section-title').should('be.visible')
    cy.get('.begin-section-description').should('be.visible')
    cy.get('.begin-section-button1').should('be.visible')
    cy.get('.begin-section-button1').click()
    cy.url().should('include', '/providers')
    cy.get('.main-logo').click()
    cy.url().should('include', '/')
    cy.get('.begin-section-button2').should('be.visible')
    cy.get('.begin-section-button2').click()
    cy.url().should('include', '/screening')
    cy.get('.main-logo').click()
    cy.url().should('include', '/')
    cy.get('.begin-section-button3').should('be.visible')
    cy.get('.begin-section-button3').click()
    cy.url().should('include', '/contact')
  })

  it('should display the "Icons" section', () => {
    cy.get('#view > :nth-child(1) > a > img').should('be.visible')
    cy.get('#view > :nth-child(2) > a > img').should('be.visible')
    cy.get('#view > :nth-child(3) > a > img').should('be.visible')
    cy.get('#view > :nth-child(4) > a > img').should('be.visible')
  })

  it('should display the "Spanish" section', () => {
    cy.get('.spanish-section-title').should('be.visible')
    cy.get('.spanish-section-description').should('be.visible')
    cy.get('.spanish-section-button').should('be.visible')
    cy.get('.spanish-section-image').should('be.visible')
    cy.get('.spanish-section-button').click()
    cy.url().should('include', '/providers')
  })
})