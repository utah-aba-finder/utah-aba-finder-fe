describe('page not found test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/no')
  })
  it.only("should show a error message or image if the page doesn't exist", () => {
    cy.get('.pageNotFoundWrapper').should('exist')
    cy.get('canvas').should('exist')
  })
  it('should have a button to go back to the home page', () => {
    cy.get('.homeButton').should('exist')
      .and('contain', 'Home')
      .click()
      .url().should('include', '/')
  })
})