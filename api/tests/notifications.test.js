jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    chat: {
      count: jest.fn(),
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

describe('GET /api/users/notification', () => {
  it('returns 401 without authentication', async () => {
    const res = await request(app).get('/api/users/notification');
    expect(res.status).toBe(401);
  });

  it('returns 200 with a numeric count of unseen chats', async () => {
    prisma.chat.count.mockResolvedValue(3);

    const token = makeToken('user1');
    const res = await request(app)
      .get('/api/users/notification')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('number');
    expect(res.body).toBe(3);
  });

  it('returns 0 when the user has no unseen chats', async () => {
    prisma.chat.count.mockResolvedValue(0);

    const token = makeToken('user1');
    const res = await request(app)
      .get('/api/users/notification')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toBe(0);
  });
});
