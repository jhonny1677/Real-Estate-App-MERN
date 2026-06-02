const mockPosts = [
  {
    id: 'cy-prop-1',
    title: 'Sunny Riverside Villa',
    price: 875000,
    address: '7 River Rd, Austin, TX',
    bedroom: 3,
    bathroom: 2,
    images: [],
    userId: 'seller-x',
    user: { username: 'realtor', avatar: null },
    type: 'house',
    status: 'available',
  },
];

const mockSinglePost = {
  ...mockPosts[0],
  isSaved: false,
  latitude: 30.2672,
  longitude: -97.7431,
  postDetail: {
    desc: 'A sunny riverside villa.',
    utilities: 'owner',
    pet: 'allowed',
    income: 'Flexible',
    size: 1200,
    school: 300,
    bus: 150,
    restaurant: 80,
  },
};

describe('Property Detail', () => {
  beforeEach(() => {
    // Register the broad list intercept FIRST so Cypress (LIFO) checks the
    // specific single-post intercept (registered last) first for /posts/:id URLs.
    cy.intercept('GET', /\/posts/, {
      statusCode: 200,
      body: { posts: mockPosts, total: 1, page: 1, pages: 1 },
    }).as('getPosts');

    cy.intercept('GET', /\/posts\/cy-prop-1/, {
      statusCode: 200,
      body: mockSinglePost,
    }).as('getSinglePost');

    // Delay the Overpass request so the loading spinner stays visible long enough to assert
    cy.intercept('GET', 'https://overpass-api.de/**', (req) => {
      req.reply({ delay: 2000, statusCode: 200, body: { elements: [] } });
    }).as('overpass');
  });

  it('shows property detail page with title, price, and nearby places tab', () => {
    cy.visit('/list');

    cy.wait('@getPosts');
    cy.get('.card').should('have.length.greaterThan', 0);

    // Click the title link of the first card to navigate to the detail page
    cy.get('.card').first().find('h2 a').click();

    cy.url().should('include', '/property/');

    // Property title heading and price are visible
    cy.get('h1').should('be.visible');
    cy.get('.price').first().should('be.visible');

    // Scroll the tab button into view, then click it
    cy.contains('button', '📍 Nearby Places').scrollIntoView().click();

    // The section heading renders immediately when the tab is active
    cy.get('.nearby-tab h3').should('contain', '📍 Nearby Places');

    // NearbyPlaces starts fetching — loading spinner should be present
    cy.get('.nearby-loading').should('be.visible');
    cy.get('.nearby-spinner').should('exist');
  });
});
