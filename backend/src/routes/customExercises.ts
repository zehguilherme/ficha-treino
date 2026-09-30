import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { prisma } from '../db.js';
import { WeekDay } from '../generated/prisma/client.js';
import { requireAuth } from '../middleware/auth.js';
import { customExerciseBodySchema } from '../validators/customExercises.js';
import { exerciseDetailsSchema } from '../validators/responses.js';

const exerciseSelect = {
  id: true,
  name: true,
  isCustom: true,
  force: true,
  level: true,
  mechanic: true,
  equipment: true,
  primaryMuscles: true,
  secondaryMuscles: true,
  instructions: true,
  category: true,
  images: true,
} as const;

export const customExercisesRouter = Router();

/**
 * @openapi
 * /api/workouts/{weekDay}/custom-exercises:
 *   post:
 *     tags: [Exercises]
 *     summary: Cria um exercício personalizado privado e adiciona-o ao treino
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: weekDay
 *         required: true
 *         schema:
 *           type: string
 *           enum: [DOMINGO, SEGUNDA, TERCA, QUARTA, QUINTA, SEXTA, SABADO]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, primaryMuscle]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 255
 *               primaryMuscle:
 *                 type: string
 *     responses:
 *       201:
 *         description: Associação criada com done inicialmente falso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido ou ausente
 *       404:
 *         description: Treino não encontrado
 *       409:
 *         description: Exercício já existe no treino
 */
customExercisesRouter.post('/:weekDay/custom-exercises', requireAuth, async (req, res) => {
  const claims = req.user;
  if (!claims) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
    return;
  }

  const weekDay = Object.values(WeekDay).find((value) => value === req.params.weekDay);
  const bodyResult = customExerciseBodySchema.safeParse(req.body);
  if (!weekDay || !bodyResult.success) {
    res.status(400).json({ error: 'Dados do exercício personalizado inválidos' });
    return;
  }

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const workout = await transaction.workout.findUnique({
        where: { userId_weekDay: { userId: claims.user_id, weekDay } },
        select: { id: true },
      });
      if (!workout) return null;

      const exercise = await transaction.exercise.create({
        data: {
          id: `custom-${randomUUID()}`,
          name: bodyResult.data.name,
          force: null,
          level: null,
          mechanic: null,
          equipment: null,
          primaryMuscles: [bodyResult.data.primaryMuscle],
          secondaryMuscles: [],
          instructions: [],
          category: null,
          images: [],
          customWorkoutId: workout.id,
          isCustom: true,
        },
        select: { id: true },
      });

      return transaction.workoutExercise.create({
        data: { workoutId: workout.id, exerciseId: exercise.id, done: false },
        select: { id: true, exerciseId: true, done: true },
      });
    });

    if (!result) {
      res.status(404).json({ error: 'Treino não encontrado' });
      return;
    }

    res.status(201).json(result);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      res.status(409).json({ error: 'Exercício já está no treino' });
      return;
    }
    throw error;
  }
});

/**
 * @openapi
 * /api/workouts/{weekDay}/custom-exercises/{exerciseId}:
 *   patch:
 *     tags: [Exercises]
 *     summary: Atualiza um exercício personalizado do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: weekDay
 *         required: true
 *         schema:
 *           type: string
 *           enum: [DOMINGO, SEGUNDA, TERCA, QUARTA, QUINTA, SEXTA, SABADO]
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, primaryMuscle]
 *             properties:
 *               name:
 *                 type: string
 *               primaryMuscle:
 *                 type: string
 *     responses:
 *       200:
 *         description: Exercício atualizado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido ou ausente
 *       404:
 *         description: Exercício personalizado não encontrado
 */
customExercisesRouter.patch(
  '/:weekDay/custom-exercises/:exerciseId',
  requireAuth,
  async (req, res) => {
    const claims = req.user;
    if (!claims) {
      res.status(401).json({ error: 'Token inválido ou expirado' });
      return;
    }

    const weekDay = Object.values(WeekDay).find((value) => value === req.params.weekDay);
    const bodyResult = customExerciseBodySchema.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({ error: 'Dados do exercício personalizado inválidos' });
      return;
    }

    if (!weekDay) {
      res.status(404).json({ error: 'Treino não encontrado' });
      return;
    }

    const workout = await prisma.workout.findUnique({
      where: { userId_weekDay: { userId: claims.user_id, weekDay } },
      select: { id: true },
    });
    if (!workout) {
      res.status(404).json({ error: 'Treino não encontrado' });
      return;
    }

    const exerciseId = String(req.params.exerciseId);
    const existing = await prisma.exercise.findFirst({
      where: { id: exerciseId, customWorkoutId: workout.id, isCustom: true },
      select: { id: true },
    });
    if (!existing) {
      res.status(404).json({ error: 'Exercício personalizado não encontrado' });
      return;
    }

    const exercise = await prisma.exercise.update({
      where: { id: existing.id },
      data: {
        name: bodyResult.data.name,
        primaryMuscles: [bodyResult.data.primaryMuscle],
      },
      select: exerciseSelect,
    });

    res.json(exerciseDetailsSchema.parse(exercise));
  },
);

/**
 * @openapi
 * /api/workouts/{weekDay}/custom-exercises/{exerciseId}:
 *   delete:
 *     tags: [Exercises]
 *     summary: Exclui um exercício personalizado do treino
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: weekDay
 *         required: true
 *         schema:
 *           type: string
 *           enum: [DOMINGO, SEGUNDA, TERCA, QUARTA, QUINTA, SEXTA, SABADO]
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exercício personalizado excluído
 *       401:
 *         description: Token inválido ou ausente
 *       404:
 *         description: Treino ou exercício personalizado não encontrado
 */
customExercisesRouter.delete(
  '/:weekDay/custom-exercises/:exerciseId',
  requireAuth,
  async (req, res) => {
    const claims = req.user;
    if (!claims) {
      res.status(401).json({ error: 'Token inválido ou expirado' });
      return;
    }

    const weekDay = Object.values(WeekDay).find((value) => value === req.params.weekDay);
    if (!weekDay) {
      res.status(404).json({ error: 'Treino não encontrado' });
      return;
    }

    const workout = await prisma.workout.findUnique({
      where: { userId_weekDay: { userId: claims.user_id, weekDay } },
      select: { id: true },
    });
    if (!workout) {
      res.status(404).json({ error: 'Treino não encontrado' });
      return;
    }

    const exercise = await prisma.exercise.findFirst({
      where: {
        id: String(req.params.exerciseId),
        customWorkoutId: workout.id,
        isCustom: true,
      },
      select: { id: true },
    });
    if (!exercise) {
      res.status(404).json({ error: 'Exercício personalizado não encontrado' });
      return;
    }

    await prisma.exercise.delete({ where: { id: exercise.id } });
    res.json({ deleted: true });
  },
);
