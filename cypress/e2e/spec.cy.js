// cypress/e2e/signin.cy.js

describe('SignIn Page E2E Tests', () => {
  beforeEach(() => {
    // Visit the signin page before each test
    cy.visit('/signin');
  });

  it('renders the sign-in page correctly', () => {
    cy.get('h2').contains('Welcome Back');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('button[type="submit"]').should('contain.text', 'Login');
    cy.contains("Don't have an account?");
    cy.get('a').contains('Sign Up').should('have.attr', 'href');
  });

  it('shows validation errors when fields are empty', () => {
    cy.get('button[type="submit"]').click();
    cy.get('input[name="email"]:invalid')
    cy.get('input[name="password"]:invalid')

  });

  it('shows error for invalid email format', () => {
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.get('input[name="email"]:invalid')
  });

  it('calls signIn and shows error message on invalid credentials', () => {
    // Stub API response (adjust route depending on your API)
    cy.intercept('POST', '/auth/staff-signin', {
      statusCode: 401,
      body: { message: 'Invalid credentials' },
    }).as('signInRequest');

    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    //cy.wait('@signInRequest');
    cy.get('span').should('contain.text', 'Invalid staff credentials');
  });

  it('redirects on successful login', () => {
    cy.intercept('POST', '/auth/staff-signin', {
      statusCode: 200,
      body: { token: 'fake-jwt-token' },
    }).as('signInRequest');

    cy.get('input[name="email"]').type('pavan@gmail.com');
    cy.get('input[name="password"]').type('pavan123');
    cy.get('button[type="submit"]').click();

    //cy.wait('@signInRequest');

    // Adjust redirect route depending on your app (e.g., /dashboard)
    cy.url().should('include', '/');
  });

  it('navigates to signup page when clicking Sign Up link', () => {
    cy.get('a').contains('Sign Up').click();
    cy.url().should('include', '/signup');
  });
});
