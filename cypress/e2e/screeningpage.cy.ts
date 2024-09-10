describe('screening page test', () => {
 beforeEach(() => {
    cy.visit('http://localhost:3000/screening')
  })
  it('should have a main header', () => {
    cy.get('.toolsText').should('exist')
    .and('contain', 'Screening Tools')
  })
  it('should have a message', () => {
    cy.get('.keepInMind').should('exist')
    .and('contain', 'Keep In Mind!!')
  })
  it('should have a first paragraph message', () => {
    cy.get('.ScreeningMessage').should('exist')
    .and('contain', 'If you think that your child may have autism, you can use these screening tools as an initial step in the assessment process.')
  })
  it('should have a second paragraph message', () => {
    cy.get('.ScreeningMessage').should('exist')
    .and('contain', 'Please keep in mind that these tools are intended to identify potential signs of autism and are not a substitute for an official diagnosis. Please seek a certified helthcare professional for an official diagnosis.')
  })
  it('should have a description for the M-CHAT test', () => {
    cy.get('.ScreeningMessage').should('exist')
    .and('contain', 'M-CHAT: Modified Checklist for Autism in Toddlers. For children 3 and under.')
  })
  it('should have a description for the CAST test', () => {
    cy.get('.ScreeningMessage').should('exist')
    .and('contain', 'CAST: Childhood Autism Spectrum Test. For children 4 and older.')
  })
  it('should have a button for the CAST test', () => {
    cy.get('.ScreeningButton2').should('exist')
    .and('contain', 'TAKE THE CAST')
    .should('be.visible')
    .should('have.attr', 'href', '/screening/cast')
    .click()
    .url().should('include', '/screening/cast')
  })
  it('should have a button for the M-CHAT test and be clickable', () => {
    cy.get('.ScreeningButton1').should('exist')
    .and('contain', 'TAKE THE M-CHAT')
    .should('be.visible')
    .should('have.attr', 'aria-label', 'm-cat test button')
    .click()
  })
})