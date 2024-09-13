describe('Providers Page', () => {
  beforeEach(() => {
    cy.setUpProvidersIntercepts();
    cy.visit('http://localhost:3000/providers');
  })

  it('displays the Search Bar and its placeholders', () => {
    cy.get('.provider-map-searchbar').should('exist')

    cy.get('.provider-map-searchbar input[type="text"]')
      .should('have.attr', 'placeholder', 'Search for a provider...');
    cy.get('.provider-county-dropdown select')
      .should('have.value', '')
      .contains('All Counties');
    cy.get('.provider-insurance-dropdown select')
      .should('have.value', '')
      .contains('All Insurances');
    cy.get('.provider-spanish-dropdown select')
      .should('have.value', '')
      .contains('Spanish?');
    cy.get('.provider-service-dropdown select')
      .should('have.value', '')
      .contains('All Services');
    cy.get('.provider-waitlist-dropdown select')
      .should('have.value', '')
      .contains('All Waitlist Status');
  })

  it('displays Search and Reset buttons with correct labels', () => {
    cy.get('.provider-search-button')
      .should('exist')
      .should('have.text', 'Search');

    cy.get('.provider-reset-button')
      .should('exist')
      .should('have.text', 'Reset');
  });

  it('displays the first Provider card with correct details', () => {
    cy.get('.searched-provider-card').first().within(() => {
      cy.get('h3').should('contain.text', 'Catalyst Behavior Solutions');
      cy.get('.searched-provider-card-info')
        .should('contain.text', 'Phone: 1-866-569-7395');
      cy.get('h4')
        .should('contain.text', '6033 Fashion Point Dr');
      cy.get('button.view-details-button')
        .should('contain.text', 'View Details');
      cy.get('select.view-on-map-dropdown')
        .should('contain.text', 'Select Location to View on Map');
    });
  });
})