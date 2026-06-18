jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    booking: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
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
const POST_ID = '507f1f77bcf86cd799439011';
const BOOKING_ID = 'booking123';

function makeToken(userId, role = 'user') {
  return jwt.sign({ id: userId, role }, TEST_SECRET);
}

const validBookingBody = {
  postId: POST_ID,
  visitType: 'in-person',
  date: '2030-12-01',
  time: '10:00',
  fee: 50,
  contactInfo: { name: 'Alice', email: 'alice@test.com', phone: '555-0100' },
  notes: '',
  paymentId: null,
  paymentMethod: 'demo',
};

beforeAll(() => {
  process.env.JWT_SECRET_KEY = TEST_SECRET;
});

afterEach(() => jest.clearAllMocks());

describe('POST /api/bookings/confirm', () => {
  it('returns 401 without authentication', async () => {
    const res = await request(app).post('/api/bookings/confirm').send(validBookingBody);
    expect(res.status).toBe(401);
  });

  it('returns 400 when booking date is in the past', async () => {
    const token = makeToken('user1');
    const res = await request(app)
      .post('/api/bookings/confirm')
      .set('Cookie', `token=${token}`)
      .send({ ...validBookingBody, date: '2000-01-01' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/past date/i);
  });

  it('returns 409 when the time slot is already booked', async () => {
    prisma.booking.findFirst.mockResolvedValue({ id: 'existing' });

    const token = makeToken('user1');
    const res = await request(app)
      .post('/api/bookings/confirm')
      .set('Cookie', `token=${token}`)
      .send(validBookingBody);

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already booked/i);
  });

  it('returns 201 and the booking object on success', async () => {
    prisma.booking.findFirst.mockResolvedValue(null);
    prisma.booking.create.mockResolvedValue({
      id: BOOKING_ID,
      userId: 'user1',
      postId: POST_ID,
      status: 'confirmed',
    });

    const token = makeToken('user1');
    const res = await request(app)
      .post('/api/bookings/confirm')
      .set('Cookie', `token=${token}`)
      .send(validBookingBody);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('confirmed');
  });
});

describe('GET /api/bookings/my', () => {
  it('returns 401 without authentication', async () => {
    const res = await request(app).get('/api/bookings/my');
    expect(res.status).toBe(401);
  });

  it('returns 200 with an array of the user\'s bookings', async () => {
    prisma.booking.findMany.mockResolvedValue([{ id: BOOKING_ID, status: 'confirmed' }]);

    const token = makeToken('user1');
    const res = await request(app)
      .get('/api/bookings/my')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });
});

describe('DELETE /api/bookings/:id', () => {
  it('returns 401 without authentication', async () => {
    const res = await request(app).delete(`/api/bookings/${BOOKING_ID}`);
    expect(res.status).toBe(401);
  });

  it('returns 404 when booking does not exist', async () => {
    prisma.booking.findUnique.mockResolvedValue(null);

    const token = makeToken('user1');
    const res = await request(app)
      .delete(`/api/bookings/${BOOKING_ID}`)
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(404);
  });

  it('returns 403 when a non-owner tries to cancel the booking', async () => {
    prisma.booking.findUnique.mockResolvedValue({ id: BOOKING_ID, userId: 'owner1' });

    const token = makeToken('other-user');
    const res = await request(app)
      .delete(`/api/bookings/${BOOKING_ID}`)
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(403);
  });

  it('returns 200 and cancels the booking for the owner', async () => {
    prisma.booking.findUnique.mockResolvedValue({ id: BOOKING_ID, userId: 'user1' });
    prisma.booking.update.mockResolvedValue({ id: BOOKING_ID, status: 'cancelled' });

    const token = makeToken('user1');
    const res = await request(app)
      .delete(`/api/bookings/${BOOKING_ID}`)
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/cancelled/i);
  });
});
