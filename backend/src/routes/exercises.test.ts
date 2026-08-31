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

type SqlQuery = {
  values: unknown[];
  strings: readonly string[];
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

const getSqlQuery = (callIndex: number): SqlQuery => {
  const query = prisma.$queryRaw.mock.calls[callIndex]?.[0];
  if (!query || typeof query !== 'object' || !('values' in query) || !('strings' in query)) {
    throw new Error('Expected a Prisma SQL query');
  }
  return query as SqlQuery;
};

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

  test('GET /api/exercises applies repeated scalar and array filters', async () => {
    const exercise = makeExercise();
    prisma.$queryRaw.mockResolvedValueOnce([exercise]).mockResolvedValueOnce([{ total: 1 }]);

    const token = signJwt({ user_id: 1, google_id: 'google-123' });
    const response = await request(app)
      .get(
        '/api/exercises?category=forca&category=alongamento&equipment=halteres&level=intermediario&force=push&mechanic=composto&primaryMuscle=peito&primaryMuscle=ombros&secondaryMuscle=triceps',
      )
      .set('Authorization', 'Bearer ' + token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ items: [exercise], total: 1 });

    const itemQuery = getSqlQuery(0);
    const itemSql = itemQuery.strings.join('?');
    expect(itemSql).toContain('category');
    expect(itemSql).toContain('equipment');
    expect(itemSql).toContain('primary_muscles');
    expect(itemSql).toContain('secondary_muscles');
    expect(itemQuery.values).toEqual(
      expect.arrayContaining([
        'forca',
        'alongamento',
        'halteres',
        'intermediario',
        'push',
        'composto',
        'peito',
        'ombros',
        'triceps',
      ]),
    );
    expect(getSqlQuery(1).values).toEqual(expect.arrayContaining(itemQuery.values.slice(0, -2)));
  });

  test('GET /api/exercises ignores empty filters', async () => {
    const exercise = makeExercise();
    prisma.$queryRaw.mockResolvedValueOnce([exercise]).mockResolvedValueOnce([{ total: 1 }]);

    const token = signJwt({ user_id: 1, google_id: 'google-123' });
    const response = await request(app)
      .get('/api/exercises?category=forca&equipment=')
      .set('Authorization', 'Bearer ' + token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ items: [exercise], total: 1 });
    expect(getSqlQuery(0).values).not.toContain('');
  });

  test('GET /api/exercises rejects values outside fixed filter lists', async () => {
    const token = signJwt({ user_id: 1, google_id: 'google-123' });
    const response = await request(app)
      .get('/api/exercises?category=Todos&equipment=unknown')
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
