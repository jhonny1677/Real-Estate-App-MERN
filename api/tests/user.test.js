// NOTE: GET /api/users/:id is currently commented out in user.route.js.
// These tests cover the same auth/access-control scenarios using available
// routes: profilePosts (own-profile access) and PUT /:id (cross-user protection).

jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    post: {
      findMany: jest.fn(),
    },
    savedPost: {
      findMany: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  },
}));

import request from 'supertest';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { createTestApp } from './testApp.js';

const app = createTestApp();
const TEST_SECRET = 'test-secret-key';

function makeToken(userId) {
  return jwt.sign({ id: userId, role: 'user' }, TEST_SECRET);
}

beforeAll(() => {
  process.env.JWT_SECRET_KEY = TEST_SECRET;
});

afterEach(() => jest.clearAllMocks());

describe('GET /api/users/profilePosts', () => {
  it('returns 401 without authentication', async () => {
    const res = await request(app).get('/api/users/profilePosts');
    expect(res.status).toBe(401);
  });

  it('returns 200 with userPosts and savedPosts for authenticated user', async () => {
    prisma.post.findMany.mockResolvedValue([]);
    prisma.savedPost.findMany.mockResolvedValue([]);

    const token = makeToken('user123');
    const res = await request(app)
      .get('/api/users/profilePosts')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('userPosts');
    expect(res.body).toHaveProperty('savedPosts');
    expect(Array.isArray(res.body.userPosts)).toBe(true);
    expect(Array.isArray(res.body.savedPosts)).toBe(true);
  });
});

describe('PUT /api/users/:id', () => {
  it('returns 403 when a user tries to update another user\'s profile', async () => {
    const token = makeToken('user-a');

    const res = await request(app)
      .put('/api/users/user-b')
      .set('Cookie', `token=${token}`)
      .send({ username: 'hacked' });

    expect(res.status).toBe(403);
  });
});
