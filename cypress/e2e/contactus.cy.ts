describe('template spec', () => {
  beforeEach(() => {
    cy.visit('localhost:3000/contact')
  })
  it('should display the contact us page', () => {
    cy.get('.contact-banner-title').should('be.visible')
    cy.get('.contact-input-name').should('be.visible')
    cy.get('.contact-input-email').should('be.visible')
    cy.get('.contact-input-email').should('be.visible')
    cy.get('.contact-page-button').should('be.visible')
  })

  it('should change input-name border color to green on input', () => {
    cy.get('.contact-input-name').type('sampleName');
    cy.get('.contact-input-name').should('have.css', 'border-color', 'rgb(128, 128, 128)');
  })

  it('should change input-email border color to green on input', () => {
    cy.get('.contact-input-email').type('sampleEmail@email.com');
    cy.get('.contact-input-email').should('have.css', 'border-color', 'rgb(128, 128, 128)');
  })

  it('should be able to send message', () => {
    cy.get('.contact-input-name').type('sampleName');
    cy.get('.contact-input-email').type('sampleEmail@email.com');
    cy.get('.contact-input-message').type('sampleMessage');
    cy.get('.contact-page-button').click();
  })
})
