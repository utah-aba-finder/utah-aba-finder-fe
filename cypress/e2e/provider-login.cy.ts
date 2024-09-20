describe('Providers Page', () => {
  beforeEach(() => {
    cy.setUpIntercepts(1);
    cy.visit('http://localhost:3000/login');
  })

  it('should have a main header', () => {
    cy.get('.loginImageText').should('contain', 'Provider Login')
  })
  it('should have a user icon', () => {
    cy.get('.userIcon').should('exist')
  })
  it('should have a password icon', () => {
    cy.get('.lockIcon').should('exist')
  })
  it('should have a password input', () => {
    cy.get('#password').should('exist')
  })
  it('should have a username input', () => {
    cy.get('#username').should('exist')
  })
  it('should have a submit button', () => {
    cy.get('.loginButton').should('exist')
  })
  it('should have a sign up button for no existent users', () => {
    cy.get('.loginButton').should('exist')
  })
  it('should have a forgot password link', () => {
    cy.get('.forgot-password').should('exist')
  })
  it('should have a eye button to show password', () => {
    cy.get('.eyeButton').should('exist')
  })
  it('should have a eye icon', () => {
    cy.get('.eye').should('exist')
  })
  it('should require a username and password', () => {
    cy.get('#login').should('be.enabled')
      .click()
    cy.get('#username').should('have.attr', 'required');

    cy.get('#password').should('have.attr', 'required');
  })

  it.skip('should redirect to signup page when sign up button is clicked', () => {
    cy.get('#signup').click()
    cy.url().should('include', '/signup')
  })
  it.skip('should redirect to forgot password page when forgot password link is clicked', () => {
    cy.get('.forgot-password').click()
    cy.url().should('include', '/forgot-password')
  })
  it.skip('should throw an error when the user does not exist', () => {
    cy.get('#username').type('user')
    cy.get('#password').type('password')
    cy.get('#login').click()
    cy.get('.error').should('exist')
  })
  it.skip('should redirect to providers info page when login is successful', () => {
    cy.get('#username').type('user')
    cy.get('#password').type('password')
    cy.get('#login').click()
    cy.url().should('include', '/user:id')
  })



  it('should log a Provider in and display their information correctly', () => {
    cy.get('#username').type('test@test.com');
    cy.get('#password').type('password');
    cy.get('#login').click();

    cy.wait('@postLogin').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      const authHeader = interception.response.headers['Authorization'];
      expect(authHeader).to.eq('Bearer mock-auth-token');
      window.sessionStorage.setItem('authToken', 'mock-auth-token');
    });

    cy.wait('@fetchSingleProvider').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body.data[0].attributes).to.have.property('name', 'Affinity Autism Services');
    });

    cy.get('.user-info-section h1').should('contain', 'Welcome, Affinity Autism Services');
    cy.get('#dropdown-menu').should('exist');
    cy.get('#dropdown-menu').select('Select location').should('have.value', '');
    cy.get('input[name="website"]').should('have.value', 'www.affinityautism.com');
    cy.get('input[name="spanish"]').should('have.value', 'limited');
    cy.get('input[name="min_age"]').should('have.value', '1.5');
    cy.get('input[name="max_age"]').should('have.value', '21');
    cy.get('input[name="waitlist"]').should('have.value', '12 months');
    cy.get('input[name="clinicServices"]').should('have.value', 'Yes');
    cy.get('input[name="homeServices"]').should('have.value', 'No');
    cy.get('input[name="telehealthServices"]').should('have.value', 'limited');

    cy.get('.select-insurance-button').should('exist').and('contain', 'Select Insurance Coverage');
    cy.get('.select-counties-button').should('exist').and('contain', 'Select Counties');

    cy.get('.save-button').should('exist').and('contain', 'Save');
    cy.get('.cancel-button').should('exist').and('contain', 'Cancel');
  });
})