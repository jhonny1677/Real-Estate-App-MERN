describe('Authentication', () => {
  it('logs in with demo credentials and shows user in navbar', () => {
    // Stub the login endpoint regardless of the actual base URL
    cy.intercept('POST', /\/auth\/login/, {
      statusCode: 200,
      body: { id: 1, username: 'demo', email: 'demo@example.com', avatar: null, role: 'user' },
    }).as('loginRequest');

    cy.visit('/login');

    cy.get('#login-username').type('demo');
    cy.get('#login-password').type('demo');
    cy.contains('button', 'Sign In').click();

    cy.wait('@loginRequest');

    // URL must no longer be /login
    cy.url().should('not.include', '/login');

    // Navbar shows the logged-in username
    cy.get('.avatar-username').should('contain', 'demo');
  });
});
