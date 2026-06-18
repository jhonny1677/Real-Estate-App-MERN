jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    post: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    postDetail: {
      delete: jest.fn(),
    },
    priceHistory: {
      create: jest.fn(),
    },
    savedPost: {
      findUnique: jest.fn(),
    },
  },
}));

import request from 'supertest';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { createTestApp } from './testApp.js';

const app = createTestApp();
const VALID_POST_ID = '507f1f77bcf86cd799439011';
const TEST_SECRET = 'test-secret-key';

function makeToken(userId, role = 'user') {
  return jwt.sign({ id: userId, role }, TEST_SECRET);
}

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

  it('returns 400 when postData is missing from body', async () => {
    const token = makeToken('user1');
    const res = await request(app)
      .post('/api/posts')
      .set('Cookie', `token=${token}`)
      .send({ postDetail: {} });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Missing postData/i);
  });

  it('returns 400 when required postData fields are missing', async () => {
    const token = makeToken('user1');
    const res = await request(app)
      .post('/api/posts')
      .set('Cookie', `token=${token}`)
      .send({ postData: { title: 'Incomplete Post' } });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Missing required fields/i);
  });

  it('returns 200 and creates the post when authenticated with valid data', async () => {
    prisma.post.create.mockResolvedValue({ ...mockPost, userId: 'user1' });

    const token = makeToken('user1');
    const res = await request(app)
      .post('/api/posts')
      .set('Cookie', `token=${token}`)
      .send({
        postData: {
          title: 'Modern Apartment',
          price: 500000,
          address: '123 Main St',
          city: 'New York',
          type: 'buy',
          property: 'apartment',
        },
        postDetail: { desc: 'Nice place', size: 80 },
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
  });
});

describe('PUT /api/posts/:id', () => {
  const updateBody = {
    postData: { title: 'Updated', price: 600000 },
    postDetail: { desc: 'Updated desc', size: 90 },
  };

  it('returns 401 without authentication', async () => {
    const res = await request(app).put(`/api/posts/${VALID_POST_ID}`).send(updateBody);
    expect(res.status).toBe(401);
  });

  it('returns 404 when post does not exist', async () => {
    prisma.post.findUnique.mockResolvedValue(null);

    const token = makeToken('user1');
    const res = await request(app)
      .put(`/api/posts/${VALID_POST_ID}`)
      .set('Cookie', `token=${token}`)
      .send(updateBody);

    expect(res.status).toBe(404);
  });

  it('returns 403 when a non-owner non-admin tries to update', async () => {
    prisma.post.findUnique.mockResolvedValue({ ...mockPost, userId: 'owner1' });

    const token = makeToken('other-user');
    const res = await request(app)
      .put(`/api/posts/${VALID_POST_ID}`)
      .set('Cookie', `token=${token}`)
      .send(updateBody);

    expect(res.status).toBe(403);
  });

  it('returns 200 when the owner updates their post', async () => {
    prisma.post.findUnique.mockResolvedValue({ ...mockPost, userId: 'owner1' });
    prisma.post.update.mockResolvedValue({ ...mockPost, title: 'Updated' });

    const token = makeToken('owner1');
    const res = await request(app)
      .put(`/api/posts/${VALID_POST_ID}`)
      .set('Cookie', `token=${token}`)
      .send(updateBody);

    expect(res.status).toBe(200);
  });

  it('returns 200 when an admin updates another user\'s post', async () => {
    prisma.post.findUnique.mockResolvedValue({ ...mockPost, userId: 'owner1' });
    prisma.post.update.mockResolvedValue({ ...mockPost, title: 'Admin Updated' });

    const token = makeToken('admin1', 'admin');
    const res = await request(app)
      .put(`/api/posts/${VALID_POST_ID}`)
      .set('Cookie', `token=${token}`)
      .send(updateBody);

    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/posts/:id', () => {
  it('returns 401 without authentication', async () => {
    const res = await request(app).delete(`/api/posts/${VALID_POST_ID}`);
    expect(res.status).toBe(401);
  });

  it('returns 404 when post does not exist', async () => {
    prisma.post.findUnique.mockResolvedValue(null);

    const token = makeToken('user1');
    const res = await request(app)
      .delete(`/api/posts/${VALID_POST_ID}`)
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(404);
  });

  it('returns 403 when a non-owner non-admin tries to delete', async () => {
    prisma.post.findUnique.mockResolvedValue({ ...mockPost, userId: 'owner1' });

    const token = makeToken('other-user');
    const res = await request(app)
      .delete(`/api/posts/${VALID_POST_ID}`)
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(403);
  });

  it('returns 200 when the owner deletes their post', async () => {
    prisma.post.findUnique.mockResolvedValue({ ...mockPost, userId: 'owner1' });
    prisma.postDetail.delete.mockResolvedValue({});
    prisma.post.delete.mockResolvedValue({});

    const token = makeToken('owner1');
    const res = await request(app)
      .delete(`/api/posts/${VALID_POST_ID}`)
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it('returns 200 when an admin deletes another user\'s post', async () => {
    prisma.post.findUnique.mockResolvedValue({ ...mockPost, userId: 'owner1' });
    prisma.postDetail.delete.mockResolvedValue({});
    prisma.post.delete.mockResolvedValue({});

    const token = makeToken('admin1', 'admin');
    const res = await request(app)
      .delete(`/api/posts/${VALID_POST_ID}`)
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
  });
});

describe('GET /api/posts pagination', () => {
  it('returns page and pages metadata in the response', async () => {
    prisma.post.findMany.mockResolvedValue([mockPost]);
    prisma.post.count.mockResolvedValue(25);

    const res = await request(app).get('/api/posts?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('pages');
    expect(res.body).toHaveProperty('total', 25);
  });
});
