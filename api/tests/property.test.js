jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    post: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    savedPost: {
      findUnique: jest.fn(),
    },
  },
}));

import request from 'supertest';
import prisma from '../lib/prisma.js';
import { createTestApp } from './testApp.js';

const app = createTestApp();
const VALID_POST_ID = '507f1f77bcf86cd799439011';

const mockPost = {
  id: VALID_POST_ID,
  title: 'Modern Apartment',
  price: 500000,
  address: '123 Main St',
  city: 'New York',
  bedroom: 2,
  bathroom: 1,
  latitude: '40.7128',
  longitude: '-74.0060',
  type: 'buy',
  property: 'apartment',
  images: ['image1.jpg'],
  postDetail: {
    desc: 'A nice apartment',
    utilities: 'Owner is responsible',
    pet: 'allowed',
    income: null,
    size: 80,
    school: 5,
    bus: 2,
    restaurant: 3,
  },
  user: { id: 'owner1', username: 'owner', avatar: null },
};

beforeAll(() => {
  process.env.JWT_SECRET_KEY = 'test-secret-key';
});

afterEach(() => jest.clearAllMocks());

describe('GET /api/posts', () => {
  it('returns 200 with a posts array', async () => {
    prisma.post.findMany.mockResolvedValue([mockPost]);
    prisma.post.count.mockResolvedValue(1);

    const res = await request(app).get('/api/posts');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('posts');
    expect(Array.isArray(res.body.posts)).toBe(true);
    expect(res.body.posts.length).toBeGreaterThanOrEqual(0);
  });

  it('accepts type=buy filter and returns 200', async () => {
    prisma.post.findMany.mockResolvedValue([mockPost]);
    prisma.post.count.mockResolvedValue(1);

    const res = await request(app).get('/api/posts?type=buy');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('posts');
    expect(res.body).toHaveProperty('total');
  });

  it('accepts minPrice and maxPrice filters and returns 200', async () => {
    prisma.post.findMany.mockResolvedValue([mockPost]);
    prisma.post.count.mockResolvedValue(1);

    const res = await request(app).get('/api/posts?minPrice=300000&maxPrice=700000');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('posts');
  });
});

describe('GET /api/posts/:id', () => {
  it('returns 200 with all property fields for a valid ID', async () => {
    prisma.post.findUnique.mockResolvedValue(mockPost);
    prisma.savedPost.findUnique.mockResolvedValue(null);

    const res = await request(app).get(`/api/posts/${VALID_POST_ID}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', VALID_POST_ID);
    expect(res.body).toHaveProperty('title');
    expect(res.body).toHaveProperty('price');
    expect(res.body).toHaveProperty('postDetail');
    expect(res.body).toHaveProperty('isSaved');
  });

  it('returns 400 for an invalid post ID format', async () => {
    const res = await request(app).get('/api/posts/not-a-valid-id');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/posts', () => {
  it('returns 401 when posting without authentication', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: 'Test Property', price: 200000 });

    expect(res.status).toBe(401);
  });
});
