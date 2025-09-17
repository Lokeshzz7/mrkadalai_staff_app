// cypress/e2e/wallet.cy.js

describe('Wallet Page E2E Tests', () => {
    const creds = {
        email: 'johndoe@example.com',
        password: 'password123',
    };
  beforeEach(() => {
    cy.login('pavan@gmail.com', 'pavan123');
    // Once backend responds, JWT gets stored
    cy.url().should('include', '/');

    cy.visit('/wallet');
    cy.contains('Wallet Recharge');
    // cy.visit('/signin');
    // cy.get('input[name="email"]').type(creds.email);
    // cy.get('input[name="password"]').type(creds.password);
    // cy.get('button[type="submit"]').click();
    // cy.url().should('include', '/');
    // cy.intercept('GET',"http://51.21.198.214:5500/api/staff/outlets/get-recharge-history/1/", {
    //   statusCode: 200,
    //   body: {
    //     recharges: [
    //       {
    //         transactionId: 1,
    //         customerName: 'John Doe',
    //         time: new Date().toISOString(),
    //         amount: 200,
    //       },
    //       {
    //         transactionId: 2,
    //         customerName: 'Jane Smith',
    //         time: new Date().toISOString(),
    //         amount: 500,
    //       },
    //     ],
    //   },
    // }).as('fetchHistory');

    // cy.visit('/wallet'); // adjust route depending on your router
    // cy.wait('@fetchHistory');
  });

  it('renders wallet page correctly', () => {
    cy.contains('Wallet Recharge');
    cy.contains('Recharge History');
    cy.get('table').should('exist');
    cy.get('table').within(() => {
      cy.contains('#TXN001');
      cy.contains('John Doe');
      cy.contains('#TXN002');
      cy.contains('Jane Smith');
    });
  });

//   it('handles fetch history error', () => {
//     cy.intercept('GET', /\/staff\/outlets\/get-recharge-history\/.*/, {
//       statusCode: 500,
//     }).as('fetchHistoryError');

//     cy.visit('/wallet');
//     cy.wait('@fetchHistoryError');
//     cy.contains('Failed to fetch recharge history');
//   });

//   it('filters transactions by search text', () => {
//     cy.get('input[placeholder="Search by ID or Name"]').type('John');
//     cy.get('table').within(() => {
//       cy.contains('John Doe');
//       cy.contains('Jane Smith').should('not.exist');
//     });
//   });

//   it('refreshes recharge history', () => {
//     cy.intercept('GET', /\/staff\/outlets\/get-recharge-history\/.*/, {
//       statusCode: 200,
//       body: { recharges: [] },
//     }).as('refreshHistory');

//     cy.contains('Refresh').click();
//     cy.wait('@refreshHistory');
//     cy.get('table').should('not.contain', 'John Doe');
//   });

//   it('opens and closes manual recharge modal', () => {
//     cy.contains('Manual Recharge').click();
//     cy.contains('Manual Recharge').should('exist'); // modal title
//     cy.contains('Cancel').click();
//     cy.contains('Manual Recharge').should('not.exist');
//   });

//   it('shows validation error when required fields are missing', () => {
//     cy.contains('Manual Recharge').click();
//     cy.contains('Process Recharge').click();
//     cy.contains('Customer ID and Amount are required');
//   });

//   it('submits manual recharge successfully', () => {
//     cy.intercept('POST', '/staff/outlets/recharge-wallet/', {
//       statusCode: 200,
//       body: {},
//     }).as('manualRecharge');

//     cy.contains('Manual Recharge').click();
//     cy.get('input[placeholder="Enter customer ID"]').type('123');
//     cy.get('input[placeholder="Enter amount"]').type('250');
//     cy.get('select').select('UPI');
//     cy.get('textarea').type('Test recharge');

//     cy.contains('Process Recharge').click();
//     cy.wait('@manualRecharge');
//     cy.contains('Recharge processed successfully!'); // toast
//     cy.contains('Manual Recharge').should('not.exist');
//   });

//   it('handles recharge API error', () => {
//     cy.intercept('POST', '/staff/outlets/recharge-wallet/', {
//       statusCode: 400,
//       body: { message: 'Invalid recharge request' },
//     }).as('manualRechargeError');

//     cy.contains('Manual Recharge').click();
//     cy.get('input[placeholder="Enter customer ID"]').type('123');
//     cy.get('input[placeholder="Enter amount"]').type('250');
//     cy.contains('Process Recharge').click();
//     cy.wait('@manualRechargeError');
//     cy.contains('Invalid recharge request');
//   });
});
