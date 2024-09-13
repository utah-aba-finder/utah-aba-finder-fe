describe('information page spec', () => {
  beforeEach(() => {
    cy.visit('localhost:3000/information')
  })
  it('should display the information page', () => {
    cy.get('.info-banner-title').should('be.visible')
    cy.get('.info-content-section1').should('be.visible')
    cy.get('.info-content-section2').should('be.visible')
    cy.get('.info-content-section3').should('be.visible')
  })

})
