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

type ExerciseDetails = {
  id: string;
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
};

type WorkoutExerciseDetails = {
  id: number;
  done: boolean;
  exercise: ExerciseDetails;
};

type WorkoutDetails = {
  id: number;
  weekDay: string;
  exercises: WorkoutExerciseDetails[];
};

type MockPrisma = {
  user: {
    findUnique: jest.Mock<Promise<User | null>, [args: object]>;
  };
  workout: {
    findMany: jest.Mock<Promise<WorkoutWithCount[]>, [args: object]>;
    findUnique: jest.Mock<Promise<WorkoutDetails | null>, [args: object]>;
  };
};

jest.mock('../db.js', () => ({
  prisma: {
    user: {
      findUnique: jest.fn<Promise<User | null>, [args: object]>(),
    },
    workout: {
      findMany: jest.fn<Promise<WorkoutWithCount[]>, [args: object]>(),
      findUnique: jest.fn<Promise<WorkoutDetails | null>, [args: object]>(),
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
        weekDay: 'TERCA',
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
        { id: 3, weekDay: 'TERCA', exerciseCount: 1, exerciseNames: ['Puxada frontal'] },
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

  /**
   * Valid JWT and a populated workout for the requested weekday.
   * Mock: Prisma returns the workout with complete exercise data and the association state.
   * Assert: 200, `{ workout }` envelope, full exercise fields, and alphabetical Prisma ordering.
   */
  test('GET /api/workouts/:weekDay returns the complete sorted workout', async () => {
    prisma.workout.findUnique.mockResolvedValue({
      id: 2,
      weekDay: 'SEGUNDA',
      exercises: [
        {
          id: 45,
          done: false,
          exercise: {
            id: 'barbell-bench-press',
            name: 'Supino reto',
            force: 'push',
            level: 'intermediate',
            mechanic: 'compound',
            equipment: 'barbell',
            primaryMuscles: ['peito'],
            secondaryMuscles: ['tríceps'],
            instructions: ['Deite-se no banco.'],
            category: 'strength',
            images: ['0.jpg', '1.jpg'],
          },
        },
      ],
    });

    const token = signJwt({ user_id: 1, google_id: 'google-123' });
    const response = await request(app)
      .get('/api/workouts/SEGUNDA')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      workout: {
        id: 2,
        weekDay: 'SEGUNDA',
        exercises: [
          {
            id: 45,
            done: false,
            exercise: {
              id: 'barbell-bench-press',
              name: 'Supino reto',
              force: 'push',
              level: 'intermediate',
              mechanic: 'compound',
              equipment: 'barbell',
              primaryMuscles: ['peito'],
              secondaryMuscles: ['tríceps'],
              instructions: ['Deite-se no banco.'],
              category: 'strength',
              images: ['0.jpg', '1.jpg'],
            },
          },
        ],
      },
    });
    expect(prisma.workout.findUnique).toHaveBeenCalledWith({
      where: { userId_weekDay: { userId: 1, weekDay: 'SEGUNDA' } },
      select: {
        id: true,
        weekDay: true,
        exercises: {
          select: {
            id: true,
            done: true,
            exercise: {
              select: {
                id: true,
                name: true,
                force: true,
                level: true,
                mechanic: true,
                equipment: true,
                primaryMuscles: true,
                secondaryMuscles: true,
                instructions: true,
                category: true,
                images: true,
              },
            },
          },
          orderBy: { exercise: { name: 'asc' } },
        },
      },
    });
  });

  /**
   * Valid JWT and a workout with no exercise associations.
   * Mock: Prisma returns an existing empty workout.
   * Assert: 200 with an empty exercises array.
   */
  test('GET /api/workouts/:weekDay returns an empty workout', async () => {
    prisma.workout.findUnique.mockResolvedValue({ id: 3, weekDay: 'TERCA', exercises: [] });

    const token = signJwt({ user_id: 1, google_id: 'google-123' });
    const response = await request(app)
      .get('/api/workouts/TERCA')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      workout: { id: 3, weekDay: 'TERCA', exercises: [] },
    });
  });

  /**
   * Invalid weekday path parameter.
   * Mock: none; invalid input must be rejected before the database query.
   * Assert: 404 with the generic workout-not-found error.
   */
  test('GET /api/workouts/:weekDay returns 404 for an invalid weekday', async () => {
    const token = signJwt({ user_id: 1, google_id: 'google-123' });
    const response = await request(app)
      .get('/api/workouts/INVALIDO')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Treino não encontrado' });
    expect(prisma.workout.findUnique).not.toHaveBeenCalled();
  });

  /**
   * Accented weekday spelling.
   * Mock: none; `TERÇA` is not part of the official WeekDay enum.
   * Assert: 404 without a database query.
   */
  test('GET /api/workouts/:weekDay returns 404 for TERÇA with accent', async () => {
    const token = signJwt({ user_id: 1, google_id: 'google-123' });
    const response = await request(app)
      .get('/api/workouts/TERÇA')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Treino não encontrado' });
    expect(prisma.workout.findUnique).not.toHaveBeenCalled();
  });

  /**
   * Valid JWT but no workout matching the authenticated user and weekday.
   * Mock: Prisma returns null for the ownership-filtered query.
   * Assert: 404 with no disclosure of another user's workout.
   */
  test('GET /api/workouts/:weekDay returns 404 for a missing or foreign workout', async () => {
    prisma.workout.findUnique.mockResolvedValue(null);

    const token = signJwt({ user_id: 1, google_id: 'google-123' });
    const response = await request(app)
      .get('/api/workouts/QUARTA')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Treino não encontrado' });
    expect(prisma.workout.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_weekDay: { userId: 1, weekDay: 'QUARTA' } },
      }),
    );
  });

  /**
   * No Authorization header.
   * Mock: none; authentication middleware rejects before the workout query.
   * Assert: 401 and no Prisma lookup.
   */
  test('GET /api/workouts/:weekDay returns 401 without token', async () => {
    const response = await request(app).get('/api/workouts/SEGUNDA');

    expect(response.status).toBe(401);
    expect(prisma.workout.findUnique).not.toHaveBeenCalled();
  });
});
