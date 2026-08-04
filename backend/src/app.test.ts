import request from 'supertest';
import { app } from './app.js';

jest.mock('./db.js', () => ({
  prisma: {
    $queryRaw: jest.fn<Promise<unknown>, [unknown]>(),
  },
}));

const { prisma } = jest.requireMock('./db.js') as {
  prisma: {
    $queryRaw: jest.Mock<Promise<unknown>, [unknown]>;
  };
};

beforeEach(() => {
  jest.clearAllMocks();
});

/**
 * Integration tests for the Express app.
 * `db.js` is mocked — no real PostgreSQL connection.
 */
describe('app', () => {
  /**
   * Health endpoint happy path: DB responds to $queryRaw.
   * Assert: 200 with `{ status: 'ok' }`.
   */
  test('GET /api/health returns 200 with status ok when DB is up', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  /**
   * Health endpoint failure path: DB throws inside $queryRaw.
   * Assert: 503 with `{ status: 'error' }`.
   */
  test('GET /api/health returns 503 with status error when DB is down', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('connection refused'));

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: 'error' });
  });

  /**
   * Unknown route falls through to Express default 404 handler.
   */
  test('returns 404 for unknown routes', async () => {
    const response = await request(app).get('/api/unknown-route');

    expect(response.status).toBe(404);
  });
});
