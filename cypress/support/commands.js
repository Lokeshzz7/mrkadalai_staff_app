// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('login', (email, password) => {
  // Use cy.session to cache the login state.
    cy.session([email, password], () => {
    // Make a direct POST request to your sign-in API endpoint.
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/auth/signin', // Make sure this URL is correct!
      body: { email, password },
      // Set failOnStatusCode to false to prevent Cypress from failing the test on a 404 or 500 error.
      failOnStatusCode: false
    }).then((response) => {
      // Check for a successful response status code (e.g., 200).
      if (response.status === 200) {
        // Your application likely returns a JWT token in the response body.
        window.localStorage.setItem('authToken', response.body.token);
      } else {
        // Handle failed login more gracefully.
        // Check if the response body exists before trying to access its properties.
        const errorMessage = (response.body && response.body.message) ? response.body.message : 'Unknown error';
        throw new Error(`Login failed with status code ${response.status}: ${errorMessage}`);
      }
    });

    // The browser state with the JWT token will be cached and restored for future tests.
  });
});
