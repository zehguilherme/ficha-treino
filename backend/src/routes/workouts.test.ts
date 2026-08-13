import request from 'supertest';
import { app } from '../app.js';
import { signJwt } from '../middleware/auth.js';
import type { User } from '../generated/prisma/client.js';

type WorkoutWithCount = {
  id: number;
  weekDay: string;
  exercises: {
    exercise: {
      name: string;
    };
  }[];
  _count: {
    exercises: number;
  };
};

type MockPrisma = {
  user: {
    findUnique: jest.Mock<Promise<User | null>, [args: object]>;
  };
  workout: {
    findMany: jest.Mock<Promise<WorkoutWithCount[]>, [args: object]>;
  };
};

jest.mock('../db.js', () => ({
  prisma: {
    user: {
      findUnique: jest.fn<Promise<User | null>, [args: object]>(),
    },
    workout: {
      findMany: jest.fn<Promise<WorkoutWithCount[]>, [args: object]>(),
    },
  },
}));

const { prisma } = jest.requireMock('../db.js') as { prisma: MockPrisma };

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
  process.env.JWT_SECRET = 'test-secret';
});

/**
 * Integration tests for the workouts routes.
 * `db.js` is mocked — no real PostgreSQL connection.
 */
describe('workouts routes', () => {
  /**
   * Valid JWT and an existing user with all weekly workouts.
   * Assert: 200 with workouts ordered from DOMINGO to SABADO, `_count.exercises`
   * mapped to `exerciseCount`, and exercise relation names mapped to `exerciseNames`.
   */
  test('GET /api/workouts returns ordered workouts with exercise counts and names', async () => {
    prisma.user.findUnique.mockResolvedValue(makeUser());
    prisma.workout.findMany.mockResolvedValue([
      {
        id: 6,
        weekDay: 'SEXTA',
        exercises: [
          { exercise: { name: 'Crucifixo reto' } },
          { exercise: { name: 'Elevação lateral' } },
          { exercise: { name: 'Tríceps corda' } },
        ],
        _count: { exercises: 3 },
      },
      {
        id: 2,
        weekDay: 'SEGUNDA',
        exercises: [{ exercise: { name: 'Supino reto com barra' } }],
        _count: { exercises: 1 },
      },
      {
        id: 7,
        weekDay: 'SABADO',
        exercises: [
          { exercise: { name: 'Cadeira flexora' } },
          { exercise: { name: 'Leg press' } },
          { exercise: { name: 'Mesa flexora' } },
          { exercise: { name: 'Panturrilha em pé' } },
        ],
        _count: { exercises: 4 },
      },
      { id: 1, weekDay: 'DOMINGO', exercises: [], _count: { exercises: 0 } },
      {
        id: 4,
        weekDay: 'QUARTA',
        exercises: [
          { exercise: { name: 'Agachamento livre' } },
          { exercise: { name: 'Cadeira extensora' } },
        ],
        _count: { exercises: 2 },
      },
      {
        id: 3,
        weekDay: 'TERÇA',
        exercises: [{ exercise: { name: 'Puxada frontal' } }],
        _count: { exercises: 1 },
      },
      { id: 5, weekDay: 'QUINTA', exercises: [], _count: { exercises: 0 } },
    ]);

    const token = signJwt({ user_id: 1, google_id: 'google-123' });
    const response = await request(app)
      .get('/api/workouts')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      workouts: [
        { id: 1, weekDay: 'DOMINGO', exerciseCount: 0, exerciseNames: [] },
        {
          id: 2,
          weekDay: 'SEGUNDA',
          exerciseCount: 1,
          exerciseNames: ['Supino reto com barra'],
        },
        { id: 3, weekDay: 'TERÇA', exerciseCount: 1, exerciseNames: ['Puxada frontal'] },
        {
          id: 4,
          weekDay: 'QUARTA',
          exerciseCount: 2,
          exerciseNames: ['Agachamento livre', 'Cadeira extensora'],
        },
        { id: 5, weekDay: 'QUINTA', exerciseCount: 0, exerciseNames: [] },
        {
          id: 6,
          weekDay: 'SEXTA',
          exerciseCount: 3,
          exerciseNames: ['Crucifixo reto', 'Elevação lateral', 'Tríceps corda'],
        },
        {
          id: 7,
          weekDay: 'SABADO',
          exerciseCount: 4,
          exerciseNames: ['Cadeira flexora', 'Leg press', 'Mesa flexora', 'Panturrilha em pé'],
        },
      ],
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(prisma.workout.findMany).toHaveBeenCalledWith({
      where: { userId: 1 },
      select: {
        id: true,
        weekDay: true,
        exercises: {
          select: {
            exercise: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            exercise: {
              name: 'asc',
            },
          },
        },
        _count: { select: { exercises: true } },
      },
    });
  });

  /**
   * No Authorization header.
   * Assert: 401 from requireAuth middleware and no workout query.
   */
  test('GET /api/workouts returns 401 without token', async () => {
    const response = await request(app).get('/api/workouts');

    expect(response.status).toBe(401);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.workout.findMany).not.toHaveBeenCalled();
  });

  /**
   * Invalid JWT in Authorization header.
   * Assert: 401 from requireAuth middleware and no workout query.
   */
  test('GET /api/workouts returns 401 with invalid token', async () => {
    const response = await request(app)
      .get('/api/workouts')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.workout.findMany).not.toHaveBeenCalled();
  });

  /**
   * Valid JWT for a user id that no longer exists.
   * Assert: 404 and no data is created or queried from workouts.
   */
  test('GET /api/workouts returns 404 when the user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const token = signJwt({ user_id: 999, google_id: 'deleted-google-id' });
    const response = await request(app)
      .get('/api/workouts')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Usuário não encontrado' });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 999 } });
    expect(prisma.workout.findMany).not.toHaveBeenCalled();
  });
});
