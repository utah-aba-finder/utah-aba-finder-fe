Cypress.Commands.add('setUpProvidersIntercepts', () => {
<<<<<<< HEAD
<<<<<<< HEAD
    cy.intercept('GET', 'https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/providers', {
      statusCode: 200,
      fixture: 'providerspage.json',
    }).as('fetchProviders');
  });
=======
=======
>>>>>>> 6bc7399151c507ac204731cf8e82592cc1ea3022
  // Intercept the API call for providers
  cy.intercept('GET', 'https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/providers', {
    statusCode: 200,
    fixture: 'providerspage.json',
  }).as('fetchProviders');

  cy.intercept('GET', '**/maps/embed/v1/place**', (req) => {
    const address = req.query.q;

    req.reply({
      statusCode: 200,
      headers: { 'content-type': 'text/html' },
      body: `
        <html>
          <body>
            <h1>Mock Google Map</h1>
            <p>Showing map for address: ${address}</p>
          </body>
        </html>
      `,
    });
  }).as('googleMapsEmbed');
});
<<<<<<< HEAD
>>>>>>> 4fe5d0604359cd4a2d0fffb762ce84de991a4e8a
=======
>>>>>>> 6bc7399151c507ac204731cf8e82592cc1ea3022
