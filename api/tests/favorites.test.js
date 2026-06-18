jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    post: { findMany: jest.fn() },
    savedPost: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import request from 'supertest';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { createTestApp } from './testApp.js';

const app = createTestApp();
const TEST_SECRET = 'test-secret-key';
const POST_ID = '507f1f77bcf86cd799439011';

function makeToken(userId) {
  return jwt.sign({ id: userId, role: 'user' }, TEST_SECRET);
}

beforeAll(() => {
  process.env.JWT_SECRET_KEY = TEST_SECRET;
});

afterEach(() => jest.clearAllMocks());

describe('POST /api/users/save', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).post('/api/users/save').send({ postId: POST_ID });
    expect(res.status).toBe(401);
  });

  it('saves a post when it is not already saved', async () => {
    prisma.savedPost.findUnique.mockResolvedValue(null);
    prisma.savedPost.create.mockResolvedValue({ id: 'sp1', userId: 'user1', postId: POST_ID });

    const token = makeToken('user1');
    const res = await request(app)
      .post('/api/users/save')
      .set('Cookie', `token=${token}`)
      .send({ postId: POST_ID });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/saved/i);
    expect(prisma.savedPost.create).toHaveBeenCalledTimes(1);
  });

  it('removes a post from saved when it is already saved', async () => {
    prisma.savedPost.findUnique.mockResolvedValue({ id: 'sp1', userId: 'user1', postId: POST_ID });
    prisma.savedPost.delete.mockResolvedValue({});

    const token = makeToken('user1');
    const res = await request(app)
      .post('/api/users/save')
      .set('Cookie', `token=${token}`)
      .send({ postId: POST_ID });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/removed/i);
    expect(prisma.savedPost.delete).toHaveBeenCalledTimes(1);
  });
});

describe('GET /api/users/profilePosts', () => {
  it('returns 401 without authentication', async () => {
    const res = await request(app).get('/api/users/profilePosts');
    expect(res.status).toBe(401);
  });

  it('returns userPosts and savedPosts arrays for the authenticated user', async () => {
    const mockOwnPost = { id: POST_ID, title: 'My Listing', userId: 'user1' };
    const mockSaved = { id: 'sp1', post: { id: 'abc', title: 'Saved Listing' } };

    prisma.post.findMany.mockResolvedValue([mockOwnPost]);
    prisma.savedPost.findMany.mockResolvedValue([mockSaved]);

    const token = makeToken('user1');
    const res = await request(app)
      .get('/api/users/profilePosts')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.userPosts).toHaveLength(1);
    expect(res.body.savedPosts).toHaveLength(1);
  });
});
