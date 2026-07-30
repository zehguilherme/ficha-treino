import { seed } from './seed';

function mockPrismaClient(): {
  exercise: {
    findMany: jest.Mock<Promise<{ id: string }[]>, [args?: object]>;
    upsert: jest.Mock<Promise<object>, [object]>;
    deleteMany: jest.Mock<Promise<{ count: number }>, [object]>;
  };
  $transaction: jest.Mock<Promise<object[]>, [Promise<object>[]]>;
} {
  return {
    exercise: {
      findMany: jest.fn<Promise<{ id: string }[]>, [args?: object]>(),
      upsert: jest.fn<Promise<object>, [object]>(),
      deleteMany: jest.fn<Promise<{ count: number }>, [object]>(),
    },
    $transaction: jest.fn<Promise<object[]>, [Promise<object>[]]>(),
  };
}

let mockFetch: jest.Mock<Promise<Response>, [url: RequestInfo | URL, init?: RequestInit]>;

function setMockFetch(data: unknown): void {
  mockFetch = jest
    .fn<Promise<Response>, [url: RequestInfo | URL, init?: RequestInit]>()
    .mockResolvedValue({
      ok: true,
      json: jest.fn<Promise<unknown>, []>().mockResolvedValue(data),
    } as unknown as Response);
  globalThis.fetch = mockFetch;
}

const makeExercise = (id: string) => ({
  id,
  name: `Exercise ${id}`,
  force: null,
  level: 'beginner',
  mechanic: null,
  equipment: null,
  primaryMuscles: ['chest'],
  secondaryMuscles: [],
  instructions: ['Do it'],
  category: 'strength',
  images: [],
});

beforeEach(() => {
  jest.clearAllMocks();
});

/**
 * Unit tests for the `seed` function.
 *
 * The seed orchestrates 3 operations:
 * 1. Fetch exercise dataset via HTTP
 * 2. Batch upsert (BATCH_SIZE=50) with transactions
 * 3. Remove orphan IDs (present in DB but not in dataset)
 *
 * All tests mock fetch and PrismaClient — no real HTTP or PostgreSQL calls.
 */
describe('seed', () => {
  /**
   * Happy path: empty DB, all exercises inserted via upsert.
   * Mock: API returns 3 exercises, findMany empty, no IDs to delete.
   * Assert: upsert called 3 times (one per exercise).
   */
  test('inserts all exercises when DB is empty', async () => {
    const exercises = [makeExercise('1'), makeExercise('2'), makeExercise('3')];
    setMockFetch(exercises);
    const db = mockPrismaClient();
    db.exercise.findMany.mockResolvedValue([]);
    db.exercise.upsert.mockResolvedValue({});
    db.$transaction.mockImplementation((queries: Promise<object>[]) => Promise.all(queries));
    db.exercise.deleteMany.mockResolvedValue({ count: 0 });

    await seed(db as never);

    expect(db.exercise.upsert).toHaveBeenCalledTimes(3);
  });

  /**
   * DB already contains '1', API returns '1' and '2'.
   * Upsert of '1' updates existing, upsert of '2' inserts new.
   * Assert: upsert called 2 times with correct where clauses.
   */
  test('updates existing and inserts new exercises', async () => {
    const exercises = [makeExercise('1'), makeExercise('2')];
    setMockFetch(exercises);
    const db = mockPrismaClient();
    db.exercise.findMany.mockResolvedValue([{ id: '1' }]);
    db.exercise.upsert.mockResolvedValue({});
    db.$transaction.mockImplementation((queries: Promise<object>[]) => Promise.all(queries));
    db.exercise.deleteMany.mockResolvedValue({ count: 0 });

    await seed(db as never);

    expect(db.exercise.upsert).toHaveBeenCalledTimes(2);
    expect(db.exercise.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '1' } }),
    );
    expect(db.exercise.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '2' } }),
    );
  });

  /**
   * API returns only '1', but DB has '1', '2', '3'.
   * The findMany mock simulates Prisma WHERE filtering (notIn).
   * Assert: deleteMany called only with orphan IDs '2' and '3'.
   */
  test('removes exercises no longer in dataset', async () => {
    const exercises = [makeExercise('1')];
    setMockFetch(exercises);
    const db = mockPrismaClient();
    const dbRows = [{ id: '1' }, { id: '2' }, { id: '3' }];
    db.exercise.findMany.mockImplementation((args) => {
      const notIn =
        (args as { where?: { id?: { notIn?: string[] } } } | undefined)?.where?.id?.notIn ?? [];
      return Promise.resolve(dbRows.filter((r) => !notIn.includes(r.id)));
    });
    db.exercise.upsert.mockResolvedValue({});
    db.$transaction.mockImplementation((queries: Promise<object>[]) => Promise.all(queries));
    db.exercise.deleteMany.mockResolvedValue({ count: 2 });

    await seed(db as never);

    expect(db.exercise.deleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['2', '3'] },
        workoutExercises: { none: {} },
      },
    });
  });

  /**
   * Fetch mock returns HTTP 500.
   * Assert: seed rejects with the handled error message.
   */
  test('rejects when fetch fails', async () => {
    mockFetch = jest
      .fn<Promise<Response>, [url: RequestInfo | URL, init?: RequestInit]>()
      .mockResolvedValue({ ok: false, status: 500 } as unknown as Response);
    globalThis.fetch = mockFetch;
    const db = mockPrismaClient();
    db.exercise.findMany.mockResolvedValue([]);

    await expect(seed(db as never)).rejects.toThrow('Falha ao baixar dataset: 500');
  });

  /**
   * 51 exercises with BATCH_SIZE=50 → 2 batches → 2 transactions.
   * Assert: $transaction called 2 times.
   */
  test('processes in multiple batches above BATCH_SIZE', async () => {
    const exercises = Array.from({ length: 51 }, (_, i) => makeExercise(String(i + 1)));
    setMockFetch(exercises);
    const db = mockPrismaClient();
    db.exercise.findMany.mockResolvedValue([]);
    db.exercise.upsert.mockResolvedValue({});
    db.$transaction.mockImplementation((queries: Promise<object>[]) => Promise.all(queries));
    db.exercise.deleteMany.mockResolvedValue({ count: 0 });

    await seed(db as never);

    expect(db.$transaction).toHaveBeenCalledTimes(2);
  });
});
