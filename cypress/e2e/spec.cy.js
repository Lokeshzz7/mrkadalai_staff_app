describe('template spec', () => {
  beforeEach(() => {
    // Visit the base URL before each test in this suite.
    cy.visit('/signin');
  });
  it('correct password and username', () => {
    cy.get('[name="email"]').type('pavan@gmail.com')
    cy.get('[name="password"]').type('pavan123')
    cy.get('button[type="submit"]').contains('Sign in').should('be.enabled');
    cy.get("[type='submit']").click()
  })
  it('wrong password', () => {
    cy.get('[name="email"]').type('pavan@gmail.com')
    cy.get('[name="password"]').type('pavana123')
    cy.get("[type='submit']").click()
  })
  it('wrong username', () => {
    cy.get('[name="email"]').type('pavana@gmail.com')
    cy.get('[name="password"]').type('pavan123')
    cy.get("[type='submit']").click()
  })
  it('should display all main structural elements',()=>{
    cy.get('.mt-6.text-center.text-3xl.font-extrabold.text-gray-900').contains("Sign in to your account")
    cy.get('a').contains('create a new account').should('be.visible');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('.mt-2.text-center.text-sm.text-gray-600').contains("Or ", { matchCase: false })
    cy.get('.font-medium.text-blue-600.hover\\:text-blue-500').contains("create a new account")
    cy.get('button[type="submit"]').contains('Sign in').should('be.enabled');
  });

  it('should navigate to the sign-up page when the link is clicked', () => {
        // Find the "create a new account" link and click it.
        cy.get('a').contains('create a new account').click();

        // Assert that the URL has changed to the sign-up page.
        cy.url().should('include', '/signup');
    });

  it('should show an error for empty fields when submitting', () => {
        cy.get('button[type="submit"]').click();
        cy.get('input[name="email"]:invalid').should('exist');
        cy.get('input[name="password"]:invalid').should('exist');
    });


})