describe('footer spec', () => {
  beforeEach(() => {
    cy.visit('localhost:3000/')
  })
  it('should display the footer', () => {
    cy.get('.footer-container').should('be.visible')
  })

})
