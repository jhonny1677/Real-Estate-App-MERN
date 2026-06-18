describe('Homepage', () => {
  it('loads successfully', () => {
    cy.visit('/');
    cy.url().should('include', 'localhost:5174');
  });

  it('shows EstateHub branding', () => {
    cy.visit('/');
    cy.contains('EstateHub', { timeout: 10000 }).should('be.visible');
  });
});
