jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../lib/emailService.js', () => ({
  generateVerificationToken: jest.fn().mockReturnValue('mock-verify-token'),
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}));

import request from 'supertest';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import { createTestApp } from './testApp.js';

const app = createTestApp();
const HASHED_PW = bcrypt.hashSync('correctpassword', 10);

beforeAll(() => {
  process.env.JWT_SECRET_KEY = 'test-secret-key';
});

afterEach(() => jest.clearAllMocks());

describe('POST /api/auth/register', () => {
  it('returns 201 with valid registration data', async () => {
    prisma.user.create.mockResolvedValue({
      id: 'user1',
      username: 'newuser',
      email: 'new@example.com',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'newuser', email: 'new@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/User created successfully/);
  });

  it('returns 400 for duplicate username or email', async () => {
    const err = Object.assign(new Error('Unique constraint failed'), { code: 'P2002' });
    prisma.user.create.mockRejectedValue(err);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'existing', email: 'existing@example.com', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Username or email already exists!');
  });
});

// NOTE: Login returns 400 (not 401/404) for invalid credentials per the API's
// "Invalid Credentials!" unified response — this matches the actual controller.
describe('POST /api/auth/login', () => {
  it('returns 200 with cookie and user info for valid credentials', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user1',
      username: 'testuser',
      email: 'test@example.com',
      password: HASHED_PW,
      isEmailVerified: true,
      role: 'user',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'correctpassword' });

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.body.username).toBe('testuser');
    expect(res.body.password).toBeUndefined();
  });

  it('returns 400 for wrong password', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user1',
      username: 'testuser',
      password: HASHED_PW,
      isEmailVerified: true,
      role: 'user',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'wrongpassword' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid Credentials!');
  });

  it('returns 400 for nonexistent user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nobody', password: 'anypassword' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid Credentials!');
  });
});
