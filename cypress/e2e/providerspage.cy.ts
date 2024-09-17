describe('Providers Page', () => {
  beforeEach(() => {
    cy.setUpProvidersIntercepts();
    cy.visit('http://localhost:3000/providers');
  })

  it('should load Google Maps with the correct default address of the state of Utah', () => {
    cy.wait('@googleMapsEmbed').its('request.url').should('include', 'q=Utah');
  });


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



 it('displays the first and last Provider card with correct details', () => {

    cy.get('.searched-provider-card').first().within(() => {
      cy.get('h3').should('contain.text', 'Catalyst Behavior Solutions');
      cy.get('.searched-provider-card-info')
        .should('contain.text', 'Phone: 1-866-569-7395');

      cy.get('.searched-provider-card-info')
        .should('contain.text', 'Email: austismspecialist@gmail.com');

      cy.get('.searched-provider-card-info')
        .should('contain.text', 'Email: austismspecialist@gmail.com');

      cy.get('h4')
        .should('contain.text', '6033 Fashion Point Dr');
      cy.get('button.view-details-button')
        .should('contain.text', 'View Details');

      cy.get('select.view-on-map-dropdown')
        .should('contain.text', 'Select Location to View on Map');
    });
  });
})
     

    cy.get('.searched-provider-card').last().within(() => {
      cy.get('h3').should('contain.text', 'ABS Kids');

      cy.get('.searched-provider-card-info')
        .should('contain.text', 'Phone: (801) 935-4171')
        .and('contain.text', 'Email: info@alternativebehaviorstrategies.com');

      cy.get('h4').should('contain.text', '515 S 700 E #2A');

      cy.get('select.view-on-map-dropdown')
        .should('contain.text', 'Select Location to View on Map');

      cy.get('select.view-on-map-dropdown')
        .find('option')
        .should('have.length.greaterThan', 1);

      cy.get('select.view-on-map-dropdown')
        .find('option')
        .eq(3)
        .should('contain.text', 'Davis County Office - 2940 Church St, Layton, UT 84040');

      cy.get('select.view-on-map-dropdown').select(3);
    });

  it('should load Google Maps with the correct address after selecting Davis County Office', () => {
    cy.get('.searched-provider-card').last().within(() => {
      cy.get('select.view-on-map-dropdown').select(3);
    });

    cy.get('.google-map-section').scrollIntoView();

    cy.get('.google-map-section')
      .should('exist')
      .and('be.visible');

    cy.wait('@googleMapsEmbed').then((interception) => {
      cy.get('body').should('contain', '2940 Church St, Layton, UT 84040');
    });
  });


  it('should have a functional Search Bar that can apply each search parameter to narrow down results and reset', () => {
    cy.get('.provider-title-section')
      .should('contain.text', 'Showing 8 of 8 Providers');

    cy.get('.provider-county-select')
      .should('exist')
      .find('option')
      .should('have.length.greaterThan', 12);

    cy.get('.provider-county-select')
      .select(18);
    cy.get('.provider-search-button').click();

    cy.get('.provider-title-section')
      .should('contain.text', 'Showing 5 of 5 Providers');

    cy.get('.searched-provider-card').first().within(() => {
      cy.get('h3').should('contain.text', 'Above & Beyond Therapy');
      cy.get('.searched-provider-card-info')
        .should('contain.text', 'Phone: (801) 630-2040');
      cy.get('.searched-provider-card-info')
        .should('contain.text', 'Email: info@abtaba.com');
      cy.get('h4')
        .should('contain.text', '1234 West Road Drive');
    });

    cy.get('.provider-insurance-select')
      .should('exist')
      .find('option')
      .should('have.length.greaterThan', 12);

    cy.get('.provider-insurance-select')
      .select(18);
    cy.get('.provider-search-button').click();

    cy.get('.provider-title-section')
      .should('contain.text', 'Showing 2 of 2 Providers');

    cy.get('.searched-provider-card').first().within(() => {
      cy.get('h3').should('contain.text', 'A.B.I. Learning Center');
      cy.get('.searched-provider-card-info')
        .should('contain.text', 'Phone: (801) 998-8428');
      cy.get('.searched-provider-card-info')
        .should('contain.text', 'Email: Office@abilearningcenter.com');
      cy.get('h4')
        .should('contain.text', '12637 S 265 W');
    });
    cy.get('.provider-map-searchbar input[type="text"]').type('learn');

    cy.get('.searched-provider-card').first().within(() => {
      cy.get('h3').should('contain.text', 'A.B.I. Learning Center');
      cy.get('.searched-provider-card-info')
        .should('contain.text', 'Phone: (801) 998-8428');
      cy.get('.searched-provider-card-info')
        .should('contain.text', 'Email: Office@abilearningcenter.com');
      cy.get('h4')
        .should('contain.text', '12637 S 265 W');
    });

    cy.get('.provider-reset-button').click();

    cy.get('.provider-title-section')
      .should('contain.text', 'Showing 8 Providers');
  });

  it('should be able to filter Spanish, Services, and Waitlist and reset', () => {
    cy.get('.provider-title-section')
      .should('contain.text', 'Showing 8 of 8 Providers');

    cy.get('.provider-spanish-select')
      .should('exist')
      .find('option')
      .should('have.length.greaterThan', 1);

    cy.get('.provider-spanish-select')
      .select(1);
    cy.get('.provider-search-button').click();

    cy.get('.provider-title-section')
      .should('contain.text', 'Showing 6 of 6 Providers');

    cy.get('.searched-provider-card').first().within(() => {
      cy.get('h3').should('contain.text', 'Catalyst Behavior Solutions');
      cy.get('.searched-provider-card-info')
        .should('contain.text', 'Phone: 1-866-569-7395');
      cy.get('.searched-provider-card-info')
        .should('contain.text', 'Email: austismspecialist@gmail.com');
      cy.get('h4')
        .should('contain.text', '6033 Fashion Point Dr');
    });

    cy.get('.provider-service-select')
      .should('exist')
      .find('option')
      .should('have.length.greaterThan', 1);

    cy.get('.provider-service-select')
      .select(2);
    cy.get('.provider-search-button').click();

    cy.get('.provider-title-section')
      .should('contain.text', 'Showing 4 of 4 Providers');

    cy.get('.provider-waitlist-select')
      .should('exist')
      .find('option')
      .should('have.length.greaterThan', 1);

    cy.get('.provider-waitlist-select')
      .select(1);
    cy.get('.provider-search-button').click();

    cy.get('.provider-title-section')
      .should('contain.text', 'Showing 1 of 1 Providers');

    cy.get('.searched-provider-card').first().within(() => {
      cy.get('h3').should('contain.text', 'ABA Pediatric Autism Services');
      cy.get('.searched-provider-card-info')
        .should('contain.text', 'Phone: (801) 477-5177');
      cy.get('.searched-provider-card-info')
        .should('contain.text', 'Email: info@abapediatricautismservices.com');
      cy.get('h4')
        .should('contain.text', '744 E 400 S');
    });

    cy.get('.provider-map-searchbar input[type="text"]').type('Pediatric');
    cy.get('.provider-search-button').click();

    cy.get('.provider-title-section')
      .should('contain.text', 'Showing 1 of 1 Providers');

    cy.get('.searched-provider-card').first().within(() => {
      cy.get('h3').should('contain.text', 'ABA Pediatric Autism Services');
      cy.get('.searched-provider-card-info')
        .should('contain.text', 'Phone: (801) 477-5177');
      cy.get('.searched-provider-card-info')
        .should('contain.text', 'Email: info@abapediatricautismservices.com');
      cy.get('h4')
        .should('contain.text', '744 E 400 S');
    });

    cy.get('.provider-reset-button').click();

    cy.get('.provider-title-section')
      .should('contain.text', 'Showing 8 Providers');
  });
