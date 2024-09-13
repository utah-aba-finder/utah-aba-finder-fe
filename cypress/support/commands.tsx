Cypress.Commands.add('setUpProvidersIntercepts', () => {
    cy.intercept('GET', 'https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/providers', {
      statusCode: 200,
      fixture: 'providerspage.json',
    }).as('fetchProviders');
  });