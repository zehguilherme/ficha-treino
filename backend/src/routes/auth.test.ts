import request from 'supertest';
import { app } from '../app.js';
import { signJwt, verifyJwt } from '../middleware/auth.js';
import type { Prisma, User } from '../generated/prisma/client.js';
import type { TokenPayload, VerifyIdTokenOptions } from 'google-auth-library';

type MockTx = {
  user: {
    create: jest.Mock<Promise<User>, [args: { data: Prisma.UserCreateInput }]>;
  };
  workout: {
    createMany: jest.Mock<
      Promise<{ count: number }>,
      [args: { data: Prisma.WorkoutCreateManyInput[] }]
    >;
  };
};

type MockPrisma = {
  user: {
    findUnique: jest.Mock<Promise<User | null>, [args: object]>;
    update: jest.Mock<Promise<User>, [args: object]>;
  };
  $transaction: jest.Mock<Promise<User>, [fn: (tx: MockTx) => Promise<User>]>;
};

type MockTicket = {
  getPayload: () => TokenPayload | undefined;
};

type MockOAuthClient = {
  verifyIdToken: jest.Mock<Promise<MockTicket>, [options: VerifyIdTokenOptions]>;
  getToken: jest.Mock<Promise<{ tokens: { id_token?: string } }>, [options: object]>;
};

jest.mock('../db.js', () => ({
  prisma: {
    user: {
      findUnique: jest.fn<Promise<User | null>, [args: object]>(),
      update: jest.fn<Promise<User>, [args: object]>(),
    },
    $transaction: jest.fn<Promise<User>, [fn: (tx: MockTx) => Promise<User>]>(),
  },
}));

let mockVerifyIdToken: jest.Mock<Promise<MockTicket>, [options: VerifyIdTokenOptions]>;
let mockGetToken: jest.Mock<Promise<{ tokens: { id_token?: string } }>, [options: object]>;

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest
    .fn<MockOAuthClient, [clientId: string, clientSecret: string, redirectUri: string]>()
    .mockImplementation(() => ({
      verifyIdToken: mockVerifyIdToken,
      getToken: mockGetToken,
    })),
}));

const { prisma } = jest.requireMock('../db.js') as { prisma: MockPrisma };
const { OAuth2Client } = jest.requireMock('google-auth-library') as {
  OAuth2Client: jest.Mock<
    MockOAuthClient,
    [clientId: string, clientSecret: string, redirectUri: string]
  >;
};

const makePayload = (overrides: Partial<TokenPayload> = {}): TokenPayload => ({
  iss: 'https://accounts.google.com',
  aud: 'test-client-id',
  sub: 'google-123',
  name: 'João Teste',
  email: 'joao@teste.com',
  iat: 1700000000,
  exp: 1700003600,
  ...overrides,
});

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  googleId: 'google-123',
  name: 'João Teste',
  email: 'joao@teste.com',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  process.env.GOOGLE_CLIENT_ID = 'test-client-id';
  process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
  process.env.JWT_SECRET = 'test-secret';
  mockVerifyIdToken = jest.fn<Promise<MockTicket>, [options: VerifyIdTokenOptions]>();
  mockGetToken = jest.fn<Promise<{ tokens: { id_token?: string } }>, [options: object]>();
});

/**
 * Integration tests for the auth routes (`POST /api/auth/google`, `GET /api/auth/me`).
 * `db.js` and `google-auth-library` are mocked — no real PostgreSQL or Google calls.
 */
describe('auth routes', () => {
  /**
   * First login: no User with the googleId yet.
   * Assert: user created + 7 workouts (one per WeekDay) inside $transaction,
   * response 200 with `{ token, name, email }` and a JWT decodable with verifyJwt.
   */
  test('POST /api/auth/google creates user and 7 workouts on first login', async () => {
    mockVerifyIdToken.mockResolvedValue({ getPayload: () => makePayload() });
    prisma.user.findUnique.mockResolvedValue(null);

    const mockTx: MockTx = {
      user: {
        create: jest
          .fn<Promise<User>, [args: { data: Prisma.UserCreateInput }]>()
          .mockResolvedValue(makeUser()),
      },
      workout: {
        createMany: jest
          .fn<Promise<{ count: number }>, [args: { data: Prisma.WorkoutCreateManyInput[] }]>()
          .mockResolvedValue({ count: 7 }),
      },
    };
    prisma.$transaction.mockImplementation((fn: (tx: MockTx) => Promise<User>) => fn(mockTx));

    const response = await request(app).post('/api/auth/google').send({ token: 'valid-id-token' });

    expect(response.status).toBe(200);
    const body = response.body as { token: string; name: string; email: string };
    expect(body).toMatchObject({ name: 'João Teste', email: 'joao@teste.com' });
    expect(body.token).toEqual(expect.any(String));

    const claims = verifyJwt(body.token);
    expect(claims).toMatchObject({ user_id: 1, google_id: 'google-123' });

    expect(OAuth2Client).toHaveBeenCalledWith(
      'test-client-id',
      'test-client-secret',
      'http://localhost:3000/auth/google/callback',
    );
    expect(mockVerifyIdToken).toHaveBeenCalledWith({
      idToken: 'valid-id-token',
      audience: 'test-client-id',
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { googleId: 'google-123' } });
    expect(mockTx.user.create).toHaveBeenCalledWith({
      data: { googleId: 'google-123', name: 'João Teste', email: 'joao@teste.com' },
    });

    const createManyData = mockTx.workout.createMany.mock.calls[0][0].data;
    expect(createManyData).toHaveLength(7);
    expect(createManyData.map((workout) => workout.weekDay)).toEqual([
      'DOMINGO',
      'SEGUNDA',
      'TERÇA',
      'QUARTA',
      'QUINTA',
      'SEXTA',
      'SABADO',
    ]);
    expect(createManyData.every((workout) => workout.userId === 1)).toBe(true);
  });

  /**
   * Recurring login: User already exists for the googleId.
   * Assert: name/email updated via `user.update`, no $transaction (no new workouts),
   * response 200.
   */
  test('POST /api/auth/google updates existing user without creating workouts', async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => makePayload({ name: 'João Atualizado', email: 'novo@teste.com' }),
    });
    prisma.user.findUnique.mockResolvedValue(makeUser());
    prisma.user.update.mockResolvedValue(
      makeUser({ name: 'João Atualizado', email: 'novo@teste.com' }),
    );

    const response = await request(app).post('/api/auth/google').send({ token: 'valid-id-token' });

    expect(response.status).toBe(200);
    const body = response.body as { token: string; name: string; email: string };
    expect(body.token).toEqual(expect.any(String));
    expect(body).toMatchObject({ name: 'João Atualizado', email: 'novo@teste.com' });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { name: 'João Atualizado', email: 'novo@teste.com' },
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  /**
   * Google rejects the ID token (verifyIdToken throws).
   * Assert: 401 and no DB access.
   */
  test('POST /api/auth/google returns 401 when ID token is invalid', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('invalid_token'));

    const response = await request(app)
      .post('/api/auth/google')
      .send({ token: 'invalid-id-token' });

    expect(response.status).toBe(401);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  /**
   * Body without token or with empty token fails Zod validation.
   * Assert: 400 and verifyIdToken never called.
   */
  test('POST /api/auth/google returns 400 when token is missing or empty', async () => {
    const missing = await request(app).post('/api/auth/google').send({});

    expect(missing.status).toBe(400);

    const empty = await request(app).post('/api/auth/google').send({ token: '' });

    expect(empty.status).toBe(400);
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
  });

  /**
   * OAuth2 code flow: GET /auth/google/callback redirects back with `code`.
   * Backend exchanges the code (getToken) and verifies the resulting ID token.
   * Assert: user created + 7 workouts inside $transaction, response 200 with `{ token, name, email }`.
   */
  test('POST /api/auth/google with code creates user and 7 workouts on first login', async () => {
    mockGetToken.mockResolvedValue({ tokens: { id_token: 'id-token-from-code' } });
    mockVerifyIdToken.mockResolvedValue({ getPayload: () => makePayload() });
    prisma.user.findUnique.mockResolvedValue(null);

    const mockTx: MockTx = {
      user: {
        create: jest
          .fn<Promise<User>, [args: { data: Prisma.UserCreateInput }]>()
          .mockResolvedValue(makeUser()),
      },
      workout: {
        createMany: jest
          .fn<Promise<{ count: number }>, [args: { data: Prisma.WorkoutCreateManyInput[] }]>()
          .mockResolvedValue({ count: 7 }),
      },
    };
    prisma.$transaction.mockImplementation((fn: (tx: MockTx) => Promise<User>) => fn(mockTx));

    const response = await request(app).post('/api/auth/google').send({ code: 'valid-oauth-code' });

    expect(response.status).toBe(200);
    const body = response.body as { token: string; name: string; email: string };
    expect(body).toMatchObject({ name: 'João Teste', email: 'joao@teste.com' });
    expect(body.token).toEqual(expect.any(String));

    const claims = verifyJwt(body.token);
    expect(claims).toMatchObject({ user_id: 1, google_id: 'google-123' });

    expect(mockGetToken).toHaveBeenCalledWith({
      code: 'valid-oauth-code',
      redirect_uri: 'http://localhost:3000/auth/google/callback',
    });
    expect(mockVerifyIdToken).toHaveBeenCalledWith({
      idToken: 'id-token-from-code',
      audience: 'test-client-id',
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { googleId: 'google-123' } });
    expect(mockTx.user.create).toHaveBeenCalledWith({
      data: { googleId: 'google-123', name: 'João Teste', email: 'joao@teste.com' },
    });
    expect(mockTx.workout.createMany.mock.calls[0][0].data).toHaveLength(7);
  });

  /**
   * Recurring login via code: User already exists for the googleId.
   * Assert: name/email updated via `user.update`, no $transaction, response 200.
   */
  test('POST /api/auth/google with code updates existing user without creating workouts', async () => {
    mockGetToken.mockResolvedValue({ tokens: { id_token: 'id-token-from-code' } });
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => makePayload({ name: 'João Atualizado', email: 'novo@teste.com' }),
    });
    prisma.user.findUnique.mockResolvedValue(makeUser());
    prisma.user.update.mockResolvedValue(
      makeUser({ name: 'João Atualizado', email: 'novo@teste.com' }),
    );

    const response = await request(app).post('/api/auth/google').send({ code: 'valid-oauth-code' });

    expect(response.status).toBe(200);
    const body = response.body as { token: string; name: string; email: string };
    expect(body.token).toEqual(expect.any(String));
    expect(body).toMatchObject({ name: 'João Atualizado', email: 'novo@teste.com' });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { name: 'João Atualizado', email: 'novo@teste.com' },
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  /**
   * Google rejects the authorization code (getToken throws).
   * Assert: 401 and no DB access.
   */
  test('POST /api/auth/google returns 401 when code exchange fails', async () => {
    mockGetToken.mockRejectedValue(new Error('invalid_grant'));

    const response = await request(app)
      .post('/api/auth/google')
      .send({ code: 'invalid-oauth-code' });

    expect(response.status).toBe(401);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  /**
   * Google returns no ID token in the token response.
   * Assert: 401 and no DB access.
   */
  test('POST /api/auth/google returns 401 when code exchange yields no ID token', async () => {
    mockGetToken.mockResolvedValue({ tokens: {} });

    const response = await request(app)
      .post('/api/auth/google')
      .send({ code: 'code-without-id-token' });

    expect(response.status).toBe(401);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  /**
   * Body without both token and code fails Zod validation.
   * Assert: 400 and neither verifyIdToken nor getToken called.
   */
  test('POST /api/auth/google returns 400 when both token and code are missing', async () => {
    const response = await request(app).post('/api/auth/google').send({});

    expect(response.status).toBe(400);
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
    expect(mockGetToken).not.toHaveBeenCalled();
  });

  /**
   * Valid JWT via Bearer header.
   * Assert: 200 with `{ name, email, google_id }` fetched by `req.user.user_id`.
   */
  test('GET /api/auth/me returns user data with valid JWT', async () => {
    prisma.user.findUnique.mockResolvedValue(makeUser());

    const token = signJwt({ user_id: 1, google_id: 'google-123' });
    const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      name: 'João Teste',
      email: 'joao@teste.com',
      google_id: 'google-123',
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  /**
   * No Authorization header.
   * Assert: 401 from requireAuth middleware.
   */
  test('GET /api/auth/me returns 401 without token', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});
