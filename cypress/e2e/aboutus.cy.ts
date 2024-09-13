describe('about us page spec', () => {
  beforeEach(() => {
    cy.visit('localhost:3000/about')
  })
  it('should display about us page', () => {
    cy.get('.about-us-title').should('be.visible')
    cy.get('.about-us-content').should('be.visible')
    cy.get('.about-us-portfolio').should('be.visible')
  })
})
