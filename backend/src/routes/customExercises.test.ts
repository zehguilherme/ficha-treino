import request from 'supertest';
import { app } from '../app.js';
import { signJwt } from '../middleware/auth.js';

type CustomExercise = {
  id: string;
  name: string;
  force: string | null;
  level: string | null;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string | null;
  images: string[];
  customWorkoutId: number;
  isCustom: boolean;
};

type MockPrisma = {
  workout: { findUnique: jest.Mock };
  exercise: { create: jest.Mock; findFirst: jest.Mock; update: jest.Mock; delete: jest.Mock };
  workoutExercise: { create: jest.Mock };
  $transaction: jest.Mock;
};

jest.mock('../db.js', () => ({
  prisma: {
    workout: { findUnique: jest.fn() },
    exercise: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn(), delete: jest.fn() },
    workoutExercise: { create: jest.fn() },
    $transaction: jest.fn(),
  },
}));

const { prisma } = jest.requireMock('../db.js') as { prisma: MockPrisma };

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
});

describe('custom exercise routes', () => {
  test('creates a private custom exercise and adds it to the selected workout', async () => {
    const exercise: CustomExercise = {
      id: 'custom-1',
      name: 'Supino inclinado com halteres',
      force: null,
      level: null,
      mechanic: null,
      equipment: null,
      primaryMuscles: ['peito'],
      secondaryMuscles: [],
      instructions: [],
      category: null,
      images: [],
      customWorkoutId: 7,
      isCustom: true,
    };
    prisma.workout.findUnique.mockResolvedValue({ id: 7 });
    prisma.$transaction.mockImplementation(async (callback: (tx: MockPrisma) => Promise<unknown>) =>
      callback(prisma),
    );
    prisma.exercise.create.mockResolvedValue(exercise);
    prisma.workoutExercise.create.mockResolvedValue({
      id: 8,
      exerciseId: exercise.id,
      done: false,
    });

    const response = await request(app)
      .post('/api/workouts/TERCA/custom-exercises')
      .set('Authorization', `Bearer ${signJwt({ user_id: 1, google_id: 'google-1' })}`)
      .send({ name: exercise.name, primaryMuscle: 'peito' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 8, exerciseId: 'custom-1', done: false });
    expect(prisma.exercise.create).toHaveBeenCalled();
  });

  test('updates only a custom exercise owned by the authenticated user', async () => {
    const exercise: CustomExercise = {
      id: 'custom-1',
      name: 'Nome corrigido',
      force: null,
      level: null,
      mechanic: null,
      equipment: null,
      primaryMuscles: ['ombros'],
      secondaryMuscles: [],
      instructions: [],
      category: null,
      images: [],
      customWorkoutId: 7,
      isCustom: true,
    };
    prisma.workout.findUnique.mockResolvedValue({ id: 7 });
    prisma.exercise.findFirst.mockResolvedValue({
      id: 'custom-1',
      customWorkoutId: 7,
      isCustom: true,
    });
    prisma.exercise.update.mockResolvedValue(exercise);

    const response = await request(app)
      .patch('/api/workouts/TERCA/custom-exercises/custom-1')
      .set('Authorization', `Bearer ${signJwt({ user_id: 1, google_id: 'google-1' })}`)
      .send({ name: exercise.name, primaryMuscle: 'ombros' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: exercise.id,
      name: exercise.name,
      isCustom: exercise.isCustom,
      force: exercise.force,
      level: exercise.level,
      mechanic: exercise.mechanic,
      equipment: exercise.equipment,
      primaryMuscles: exercise.primaryMuscles,
      secondaryMuscles: exercise.secondaryMuscles,
      instructions: exercise.instructions,
      category: exercise.category,
      images: exercise.images,
    });
    expect(prisma.exercise.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'custom-1' } }),
    );
  });

  test('deletes only the custom exercise from the selected workout', async () => {
    prisma.workout.findUnique.mockResolvedValue({ id: 7 });
    prisma.exercise.findFirst.mockResolvedValue({
      id: 'custom-1',
      customWorkoutId: 7,
      isCustom: true,
    });
    prisma.exercise.delete.mockResolvedValue({ id: 'custom-1' });

    const response = await request(app)
      .delete('/api/workouts/TERCA/custom-exercises/custom-1')
      .set('Authorization', `Bearer ${signJwt({ user_id: 1, google_id: 'google-1' })}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ deleted: true });
    expect(prisma.exercise.delete).toHaveBeenCalledWith({ where: { id: 'custom-1' } });
  });

  test('does not edit a custom exercise from another workout', async () => {
    prisma.workout.findUnique.mockResolvedValue({ id: 8 });
    prisma.exercise.findFirst.mockResolvedValue(null);

    const response = await request(app)
      .patch('/api/workouts/TERCA/custom-exercises/custom-1')
      .set('Authorization', `Bearer ${signJwt({ user_id: 1, google_id: 'google-1' })}`)
      .send({ name: 'Tentativa', primaryMuscle: 'peito' });

    expect(response.status).toBe(404);
    expect(prisma.exercise.update).not.toHaveBeenCalled();
  });
});
