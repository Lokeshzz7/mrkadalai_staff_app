describe('Sign-up Page Tests', () => {
    const validData = {
        name: 'John Doe',
        email: 'johndoe@example.com',
        phone: '1234567890',
        password: 'password123',
    };

    // A hook that runs before each test to ensure we start on a clean page.
    beforeEach(() => {
        cy.visit('/signup');
    });

    // --- UI and Structural Tests ---
    // it('should display all main structural elements on the page', () => {
    //     // Assert the main heading is visible and has the correct text.
    //     cy.get('h2').contains('Create Your Account').should('be.visible');

    //     // Assert all form inputs exist and have correct attributes.
    //     cy.get('input[name="name"]').should('exist').and('have.attr', 'type', 'text');
    //     cy.get('input[name="email"]').should('exist').and('have.attr', 'type', 'email');
    //     cy.get('input[name="phone"]').should('exist').and('have.attr', 'type', 'tel');
    //     cy.get('input[name="password"]').should('exist').and('have.attr', 'type', 'password');
    //     cy.get('input[name="retypePassword"]').should('exist').and('have.attr', 'type', 'password');
        
    //     // Assert the Sign up button exists and is initially enabled.
    //     cy.get('button[type="submit"]').contains('Sign Up').should('be.enabled');
    //     //Assert the "sign in" link is visible and navigates correctly.
    //     cy.get('a')
    //         .contains('Sign In')
    //         .should('be.visible')
    //         .and('have.attr', 'href', '/signin');
    // });

    // // // --- Client-Side Validation Tests ---
    // it('should show validation errors for empty fields on submission', () => {
    //     cy.get('button[type="submit"]').click();

    //     // Assert that form validation is triggered and error messages are shown.
    //     cy.get('input[name="name"]:invalid')
    //     cy.get('input[name="email"]:invalid')
    //     cy.get('input[name="phone"]:invalid')
    //     cy.get('input[name="password"]:invalid')
    //     cy.get('input[name="retypePassword"]:invalid')
    // });

    // it('should show validation error for an invalid email format', () => {
    //     cy.get('input[name="name"]').type(validData.name);
    //     cy.get('input[name="email"]').type('invalid-email');
    //     cy.get('input[name="phone"]').type('123');
    //     cy.get('input[name="password"]').type(validData.password);
    //     cy.get('input[name="retypePassword"]').type(validData.password)
    //     cy.get('button[type="submit"]').click();
    //     cy.get('input[name="email"]:invalid')
    //     //cy.get('.text-red-500').contains('Email is invalid').should('be.visible');
    // });

    // it('should show validation error for an invalid phone number', () => {
    //     cy.get('input[name="name"]').type(validData.name);
    //     cy.get('input[name="email"]').type(validData.email);
    //     cy.get('input[name="phone"]').type('123');
    //     cy.get('input[name="password"]').type(validData.password);
    //     cy.get('input[name="retypePassword"]').type(validData.password)
    //     cy.get('button[type="submit"]').click();
    // // cy.get('input[name="phone"]:invalid')
    //     cy.get('.text-red-500').contains('Phone number is invalid').should('be.visible');
    // });

    // it('should show validation error when passwords do not match', () => {
    //     cy.get('input[name="name"]').type(validData.name);
    //     cy.get('input[name="email"]').type(validData.email);
    //     cy.get('input[name="phone"]').type(validData.phone);
    //     cy.get('input[name="password"]').type('short');
    //     cy.get('input[name="retypePassword"]').type('differ');
    //     cy.get('button[type="submit"]').click();
    //     //cy.get('input[name="password"]:invalid')
    //     cy.get('.text-red-500').contains('Passwords do not match').should('be.visible');
    // });
    
    // // --- Functional (API) Tests ---
    it('should successfully sign up with valid credentials and navigate', () => {
        // Intercept the API call to mock a successful sign-up response.
        cy.intercept('POST', 'http://51.21.198.214:5500/api/auth/staff-signup', {
            statusCode: 200,
            body: { message: 'Success' },
        }).as('signupSuccess');

        // Fill out the form with valid data.
        cy.get('input[name="name"]').type(validData.name);
        cy.get('input[name="email"]').type(validData.email);
        cy.get('input[name="phone"]').type(validData.phone);
        cy.get('input[name="password"]').type(validData.password);
        cy.get('input[name="retypePassword"]').type(validData.password);

        cy.get('button[type="submit"]').contains('Sign Up').should('be.enabled').click();

        cy.wait('@signupSuccess');

        // Assert that a success toast notification appears.
        //cy.get('.Toastify__toast--success').should('be.visible').and('contain.text', 'Staff Successfully signed UP');
        
        // Assert that the user is navigated to the sign-in page.
        cy.url().should('include', '/signin');
    });

    // it('should show an error message for a failed sign-up', () => {
    //     // Intercept the API call to mock a sign-up failure.
    //     cy.intercept('POST', 'http://51.21.198.214:5500/api/auth/staff-signup', {
    //         statusCode: 409, // Conflict for duplicate email, for example.
    //         body: { message: 'User already exists' },
    //     }).as('signupFailure');

    //     // Fill the form with valid data that will be rejected by the mock API.
    //     cy.get('input[name="name"]').type(validData.name);
    //     cy.get('input[name="email"]').type(validData.email);
    //     cy.get('input[name="phone"]').type(validData.phone);
    //     cy.get('input[name="password"]').type(validData.password);
    //     cy.get('input[name="retypePassword"]').type(validData.password);

    //     cy.get('button[type="submit"]').contains('Sign Up').should('be.enabled').click();

    //     cy.wait('@signupFailure');

    //     // Assert that the error message div is visible with the correct text.
    //     cy.get('.bg-red-100 > .block').and('contain.text', 'User already exists');
    // });
});
