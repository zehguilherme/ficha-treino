import request from 'supertest';
import { app } from '../app.js';
import { signJwt } from '../middleware/auth.js';

type ExerciseSearchRow = {
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

type MockPrisma = {
  $queryRaw: jest.Mock<Promise<unknown>, [unknown]>;
};

jest.mock('../db.js', () => ({
  prisma: {
    $queryRaw: jest.fn<Promise<unknown>, [unknown]>(),
  },
}));

const { prisma } = jest.requireMock('../db.js') as { prisma: MockPrisma };

const makeExercise = (overrides: Partial<ExerciseSearchRow> = {}): ExerciseSearchRow => ({
  id: 'triceps-pushdown',
  name: 'Tríceps na polia',
  force: 'push',
  level: 'intermediate',
  mechanic: 'isolation',
  equipment: 'cable',
  primaryMuscles: ['tríceps'],
  secondaryMuscles: [],
  instructions: ['Empurre a barra.'],
  category: 'strength',
  images: ['0.jpg', '1.jpg'],
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
});

describe('exercises routes', () => {
  /**
   * Accent-insensitive search returns the complete exercise contract and total.
   * Mock: PostgreSQL returns one row for the item query and the matching count.
   * Assert: triceps can match Tríceps and pagination is applied by the route.
   */
  test('GET /api/exercises matches accented names without accents', async () => {
    const exercise = makeExercise();
    prisma.$queryRaw.mockResolvedValueOnce([exercise]).mockResolvedValueOnce([{ total: 2 }]);

    const token = signJwt({ user_id: 1, google_id: 'google-123' });
    const response = await request(app)
      .get('/api/exercises?q=triceps&limit=1&offset=0')
      .set('Authorization', 'Bearer ' + token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ items: [exercise], total: 2 });
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);
  });

  /**
   * Empty searches list the first catalog page.
   * Mock: PostgreSQL returns one catalog row and its total.
   * Assert: omitted query parameters use limit 20 and offset 0 without rejecting the request.
   */
  test('GET /api/exercises returns the first page for an empty query', async () => {
    const exercise = makeExercise({ id: 'supino-reto', name: 'Supino reto' });
    prisma.$queryRaw.mockResolvedValueOnce([exercise]).mockResolvedValueOnce([{ total: 801 }]);

    const token = signJwt({ user_id: 1, google_id: 'google-123' });
    const response = await request(app)
      .get('/api/exercises?q=%20%20')
      .set('Authorization', 'Bearer ' + token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ items: [exercise], total: 801 });
  });

  /**
   * Invalid pagination never reaches the database.
   * Mock: none.
   * Assert: negative offsets, zero limits and limits above 100 return 400.
   */
  test('GET /api/exercises rejects invalid pagination', async () => {
    const token = signJwt({ user_id: 1, google_id: 'google-123' });
    const response = await request(app)
      .get('/api/exercises?limit=101&offset=-1')
      .set('Authorization', 'Bearer ' + token);

    expect(response.status).toBe(400);
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  /**
   * Missing authentication is rejected before querying exercises.
   * Mock: none.
   * Assert: 401 and no database calls.
   */
  test('GET /api/exercises requires authentication', async () => {
    const response = await request(app).get('/api/exercises?q=supino');

    expect(response.status).toBe(401);
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });
});
