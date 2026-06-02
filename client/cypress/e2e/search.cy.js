const mockPosts = [
  {
    id: 'cy-post-1',
    title: 'Manhattan Studio',
    price: 450000,
    address: '42 West St, New York, NY',
    bedroom: 1,
    bathroom: 1,
    images: [],
    userId: 'seller-1',
    user: { username: 'agent', avatar: null },
    type: 'apartment',
    status: 'available',
  },
  {
    id: 'cy-post-2',
    title: 'Brooklyn Loft',
    price: 620000,
    address: '99 Bridge St, New York, NY',
    bedroom: 2,
    bathroom: 2,
    images: [],
    userId: 'seller-2',
    user: { username: 'broker', avatar: null },
    type: 'house',
    status: 'available',
  },
];

describe('Search', () => {
  beforeEach(() => {
    // Register the general posts intercept first; the cities intercept is
    // registered after so Cypress (LIFO matching) uses it for /posts/cities requests.
    cy.intercept('GET', /\/posts/, {
      statusCode: 200,
      body: { posts: mockPosts, total: 2, page: 1, pages: 1 },
    }).as('getPosts');

    cy.intercept('GET', /\/posts\/cities/, {
      statusCode: 200,
      body: [],
    }).as('getCities');
  });

  it('navigates to /list with city param and shows property cards', () => {
    cy.visit('/');

    cy.get('input[name="city"]').type('New York');

    // The search control is a <Link> wrapping a <button>; click the anchor
    cy.get('.searchBar a').click();

    cy.url().should('include', '/list');
    cy.url().should('match', /city=New(%20|\+)York/);

    cy.wait('@getPosts');
    cy.get('.card').should('have.length.greaterThan', 0);
  });
});
