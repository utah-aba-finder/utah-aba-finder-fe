// commands.js
Cypress.Commands.add('setUpIntercepts', (providerId) => {
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

  cy.intercept('POST', 'https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/login', (req) => {
    req.reply({
      statusCode: 200,
      headers: {
        'Authorization': 'Bearer mock-auth-token', // Make sure this line is present
      },
      body: {
        status: {
          code: 200,
          message: "Logged in successfully"
        },
        data: {
          id: 1,
          email: "test@test.com",
          created_at: "2024-09-17T19:01:50.233Z",
          provider_id: null,
          created_date: "09/17/2024"
        }
      }
    });
  }).as('postLogin');
  
  
  
  

  cy.intercept('GET', `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/providers/${providerId}`, (req) => {
    const token = window.sessionStorage.getItem('authToken');
    if (req.headers.authorization === `Bearer ${token}`) {
      req.reply({
        statusCode: 200,
        fixture: 'singleProvider.json'
      });
    } else {
      req.reply({
        statusCode: 401,  // Unauthorized if token is missing or incorrect
        body: { error: 'Unauthorized' }
      });
    }
  }).as('fetchSingleProvider');
  
  

});
