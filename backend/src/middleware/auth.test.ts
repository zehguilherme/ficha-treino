import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { requireAuth, signJwt, verifyJwt } from './auth.js';
import type { JwtClaims } from './auth.js';

const JWT_SECRET = 'test-secret';

beforeEach(() => {
  process.env.JWT_SECRET = JWT_SECRET;
});

const protectedApp = express();
protectedApp.get('/protected', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

/**
 * Unit tests for the JWT middleware (`auth.ts`).
 *
 * `process.env.JWT_SECRET` is set in `beforeEach` — the module reads it
 * at call time, so no dotenv dependency in tests.
 */
describe('signJwt / verifyJwt', () => {
  /**
   * Round-trip: token signed with claims must verify back to the same
   * claims. Assert: user_id and google_id preserved.
   */
  test('sign then verify preserves user_id and google_id claims', () => {
    const claims = { user_id: 42, google_id: 'google-abc-123' };

    const token = signJwt(claims);
    const payload = verifyJwt(token);

    expect(payload.user_id).toBe(42);
    expect(payload.google_id).toBe('google-abc-123');
  });

  /**
   * Garbage token must be rejected by verify.
   * Assert: throws (jsonwebtoken error).
   */
  test('verify throws on invalid token', () => {
    expect(() => verifyJwt('invalid.token.value')).toThrow();
  });

  /**
   * Token signed with a negative expiration is already expired.
   * Assert: verify throws.
   */
  test('verify throws on expired token', () => {
    const expired = jwt.sign({ user_id: 1, google_id: 'g1' }, JWT_SECRET, {
      expiresIn: -1,
    });

    expect(() => verifyJwt(expired)).toThrow();
  });
});

describe('requireAuth', () => {
  /**
   * No Authorization header at all.
   * Assert: 401.
   */
  test('returns 401 when Authorization header is missing', async () => {
    const response = await request(protectedApp).get('/protected');

    expect(response.status).toBe(401);
  });

  /**
   * Well-formed header but garbage token.
   * Assert: 401.
   */
  test('returns 401 when token is invalid', async () => {
    const response = await request(protectedApp)
      .get('/protected')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(response.status).toBe(401);
  });

  /**
   * Expired token must not pass the middleware.
   * Assert: 401.
   */
  test('returns 401 when token is expired', async () => {
    const expired = jwt.sign({ user_id: 1, google_id: 'g1' }, JWT_SECRET, {
      expiresIn: -1,
    });

    const response = await request(protectedApp)
      .get('/protected')
      .set('Authorization', `Bearer ${expired}`);

    expect(response.status).toBe(401);
  });

  /**
   * Happy path: valid token reaches the handler, req.user populated,
   * next() called (the handler only runs after next()).
   * Assert: 200 and body echoes req.user.
   */
  test('populates req.user and calls next with valid token', async () => {
    const token = signJwt({ user_id: 7, google_id: 'google-xyz' });

    const response = await request(protectedApp)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    const { user } = response.body as { user: JwtClaims };
    expect(user.user_id).toBe(7);
    expect(user.google_id).toBe('google-xyz');
  });
});
