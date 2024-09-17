describe('Providers Page', () => {
  beforeEach(() => {
    cy.setUpProvidersIntercepts();
    cy.visit('http://localhost:3000/providers');
  })
  it('displays the first Providers details and be able to click on View Details to bring up the Providers Modal', () => {
    cy.get('.searched-provider-card').first().within(() => {
      cy.get('h3').should('contain.text', 'Catalyst Behavior Solutions');
      cy.get('.searched-provider-card-info')
        .should('contain.text', 'Phone: 1-866-569-7395');
      cy.get('.searched-provider-card-info')
        .should('contain.text', 'Email: austismspecialist@gmail.com');
      cy.get('h4')
        .should('contain.text', '6033 Fashion Point Dr');
      cy.get('button.view-details-button')
        .should('contain.text', 'View Details');
      cy.get('button.view-on-map-button')
        .should('contain.text', 'View on Map');
      cy.get('button.view-details-button').click()
    })
    cy.get('.modal-overlay').should('be.visible');
    cy.get('.modal-content h2').should('contain.text', 'Catalyst Behavior Solutions');

    cy.get('.modal-content .company-info').within(() => {
      cy.get('p').eq(0).should('contain.text', 'Location 1:');
      cy.get('p').eq(0).should('contain.text', '6033 Fashion Point Dr, South Ogden, UT 84403 - Phone: 1-866-569-7395');
    });
    cy.get('.modal-content .website-text').should('contain.text', 'https://catalystbehavior.com/');
    cy.get('.modal-content .email-text').should('contain.text', 'austismspecialist@gmail.com');

    cy.get('.details').within(() => {
      cy.get('p').eq(0).should('contain.text', 'Counties Served:');
      cy.get('p').eq(1).should('contain.text', 'Ages Served:');
      cy.get('p').eq(2).should('contain.text', 'Waitlist:');
      cy.get('p').eq(3).should('contain.text', 'Telehealth Services:');
      cy.get('p').eq(4).should('contain.text', 'At Home Services:');
      cy.get('p').eq(5).should('contain.text', 'In-Clinic Services:');
      cy.get('p').eq(6).should('contain.text', 'Spanish Speakers:');
      cy.get('p').eq(7).should('contain.text', 'Insurance:');
    });

    cy.get('.modal-close').click();
    cy.get('.modal-overlay').should('not.exist');
  })
})