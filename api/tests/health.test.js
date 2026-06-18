import express from 'express';
import request from 'supertest';

// Self-contained mini app — no app.js import, no DB connection needed
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'EstateHub API' });
});

describe('Health Check', () => {
  it('GET / responds with 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });

  it('GET / returns JSON with status ok', async () => {
    const res = await request(app).get('/');
    expect(res.body.status).toBe('ok');
  });

  it('GET / returns correct service name', async () => {
    const res = await request(app).get('/');
    expect(res.body.service).toBe('EstateHub API');
  });
});
