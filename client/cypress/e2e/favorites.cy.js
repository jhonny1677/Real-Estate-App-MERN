const mockPosts = [
  {
    id: 'cy-fav-1',
    title: 'Garden View Condo',
    price: 320000,
    address: '55 Park Ave, Boston, MA',
    bedroom: 2,
    bathroom: 1,
    images: [],
    userId: 'seller-a',
    user: { username: 'listingagent', avatar: null },
    type: 'apartment',
    status: 'available',
  },
];

const mockSinglePost = {
  ...mockPosts[0],
  isSaved: false,
  latitude: 42.3601,
  longitude: -71.0589,
  postDetail: {
    desc: 'A lovely garden view condo.',
    utilities: 'owner',
    pet: 'allowed',
    income: 'Flexible',
    size: 900,
    school: 200,
    bus: 100,
    restaurant: 60,
  },
};

const loginAsDemo = () => {
  cy.intercept('POST', /\/auth\/login/, {
    statusCode: 200,
    body: { id: 1, username: 'demo', email: 'demo@example.com', avatar: null, role: 'user' },
  }).as('loginRequest');

  cy.visit('/login');
  cy.get('#login-username').type('demo');
  cy.get('#login-password').type('demo');
  cy.contains('button', 'Sign In').click();
  cy.wait('@loginRequest');
  cy.url().should('not.include', '/login');
};

describe('Favorites', () => {
  beforeEach(() => {
    // Use cy.session() to avoid repeating the login UI flow on every test
    cy.session('demo-user-session', loginAsDemo, {
      validate() {
        cy.get('.avatar-username').should('exist');
      },
    });

    // Broad list intercept registered FIRST; specific single-post intercept
    // registered LAST so Cypress (LIFO) uses it for /posts/cy-fav-1 requests.
    cy.intercept('GET', /\/posts/, {
      statusCode: 200,
      body: { posts: mockPosts, total: 1, page: 1, pages: 1 },
    }).as('getPosts');

    cy.intercept('GET', /\/posts\/cy-fav-1/, {
      statusCode: 200,
      body: mockSinglePost,
    }).as('getSinglePost');
  });

  it('adds a property to favorites and shows it on the favorites page', () => {
    cy.visit('/list');

    cy.wait('@getPosts');
    cy.get('.card').should('have.length.greaterThan', 0);

    // Navigate to the property detail page
    cy.get('.card').first().find('h2 a').click();
    cy.url().should('include', '/property/');

    // Add to favorites — button text is the i18n key 'common.addToFavorites' = 'Add to Favorites'
    cy.get('.favorite-btn').should('be.visible');
    cy.get('.favorite-btn').click();

    // Go to the favorites page
    cy.visit('/favorites');

    // At least one property card should be present
    cy.get('.favorite-item').should('have.length.greaterThan', 0);

    // Empty state must not be showing
    cy.contains('No favorites yet').should('not.exist');
  });
});
