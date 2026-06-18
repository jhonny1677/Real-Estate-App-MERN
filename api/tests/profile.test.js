jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    user: {
      update: jest.fn(),
    },
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import { createTestApp } from './testApp.js';

const app = createTestApp();
const TEST_SECRET = 'test-secret-key';

function makeToken(userId, role = 'user') {
  return jwt.sign({ id: userId, role }, TEST_SECRET);
}

const mockUpdatedUser = {
  id: 'user1',
  username: 'updated_name',
  email: 'user1@test.com',
  avatar: null,
  password: 'hashed-password',
};

beforeAll(() => {
  process.env.JWT_SECRET_KEY = TEST_SECRET;
});

afterEach(() => jest.clearAllMocks());

describe('PUT /api/users/:id', () => {
  it('returns 401 without authentication', async () => {
    const res = await request(app).put('/api/users/user1').send({ username: 'new' });
    expect(res.status).toBe(401);
  });

  it('returns 403 when a user tries to update another user\'s profile', async () => {
    const token = makeToken('user-a');
    const res = await request(app)
      .put('/api/users/user-b')
      .set('Cookie', `token=${token}`)
      .send({ username: 'hacker' });

    expect(res.status).toBe(403);
  });

  it('returns 200 when a user updates their own profile', async () => {
    prisma.user.update.mockResolvedValue(mockUpdatedUser);

    const token = makeToken('user1');
    const res = await request(app)
      .put('/api/users/user1')
      .set('Cookie', `token=${token}`)
      .send({ username: 'updated_name' });

    expect(res.status).toBe(200);
    expect(res.body.username).toBe('updated_name');
    expect(res.body).not.toHaveProperty('password');
  });

  it('returns 200 when an admin updates another user\'s profile', async () => {
    prisma.user.update.mockResolvedValue({ ...mockUpdatedUser, id: 'other-user' });

    const token = makeToken('admin1', 'admin');
    const res = await request(app)
      .put('/api/users/other-user')
      .set('Cookie', `token=${token}`)
      .send({ username: 'admin-updated' });

    expect(res.status).toBe(200);
  });

  it('hashes the password when it is included in the update', async () => {
    prisma.user.update.mockResolvedValue(mockUpdatedUser);

    const token = makeToken('user1');
    await request(app)
      .put('/api/users/user1')
      .set('Cookie', `token=${token}`)
      .send({ password: 'newPlaintextPassword' });

    expect(bcrypt.hash).toHaveBeenCalledWith('newPlaintextPassword', 10);
  });
});
