process.env.MONGODB_URI = 'mongodb://localhost:27017/gemini-test';
process.env.GOOGLE_API_KEY = 'test-key';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const mongoose = require('mongoose');

// Mock mongoose
vi.mock('mongoose', {
  connect: vi.fn(() => Promise.resolve()),
  disconnect: vi.fn(() => Promise.resolve()),
  connection: {
    close: vi.fn(() => Promise.resolve()),
    readyState: 1,
    on: vi.fn(),
    once: vi.fn(),
  },
  Schema: class {},
  model: vi.fn(() => ({
    find: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    exec: vi.fn(() => Promise.resolve([])),
    findOneAndUpdate: vi.fn().mockResolvedValue({}),
    deleteOne: vi.fn().mockResolvedValue({}),
  })),
});

const app = require('../server');

describe('Backend API Integration Tests', () => {
  beforeAll(async () => {
    // Mock readyState to 1 for health check
    mongoose.connection.readyState = 1;
  });

  afterAll(async () => {
    // Use disconnect if close fails
    if (mongoose.disconnect) await mongoose.disconnect();
    else if (mongoose.connection.close) await mongoose.connection.close();
  });

  it('GET /health should return 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status');
  });

  it('POST /api/chat should validate input', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ prompt: '' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/chat should support mock streaming mode', async () => {
    process.env.MOCK_STREAM = 'true';
    const res = await request(app)
      .post('/api/chat')
      .send({ prompt: 'Hello' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.response).toContain('Simulated reply');
  });
});
