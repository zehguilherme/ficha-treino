import { Router } from 'express';
import { prisma } from '../db.js';
import { Prisma, WeekDay } from '../generated/prisma/client.js';
import { requireAuth } from '../middleware/auth.js';
import {
  workoutResponseSchema,
  workoutsResponseSchema,
  type WorkoutSummary,
} from '../validators/responses.js';
import { addWorkoutExerciseBodySchema } from '../validators/workouts.js';

const WEEK_DAY_ORDER = [
  WeekDay.DOMINGO,
  WeekDay.SEGUNDA,
  WeekDay.TERCA,
  WeekDay.QUARTA,
  WeekDay.QUINTA,
  WeekDay.SEXTA,
  WeekDay.SABADO,
];

const weekDayRank = (weekDay: WeekDay): number => WEEK_DAY_ORDER.indexOf(weekDay);

export const workoutsRouter = Router();

/**
 * @openapi
 * /api/workouts:
 *   get:
 *     tags: [Workouts]
 *     summary: Lista os 7 treinos semanais do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Treinos do usuário autenticado com contagem e nomes de exercícios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 workouts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       weekDay:
 *                         type: string
 *                         enum: [DOMINGO, SEGUNDA, TERCA, QUARTA, QUINTA, SEXTA, SABADO]
 *                       exerciseCount:
 *                         type: integer
 *                       exercises:
 *                         type: array
 *                         items:
 *                           type: object
 *                           required: [name, done]
 *                           properties:
 *                             name:
 *                               type: string
 *                             done:
 *                               type: boolean
 *       401:
 *         description: Token JWT ausente, inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Usuário autenticado não encontrado no banco
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
workoutsRouter.get('/', requireAuth, async (req, res) => {
  const claims = req.user;
  if (!claims) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: claims.user_id } });
  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }

  const workouts = await prisma.workout.findMany({
    where: { userId: claims.user_id },
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
          done: true,
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

  const summaries: WorkoutSummary[] = workouts
    .map((workout) => ({
      id: workout.id,
      weekDay: workout.weekDay,
      exerciseCount: workout._count.exercises,
      exercises: workout.exercises.map((workoutExercise) => ({
        name: workoutExercise.exercise.name,
        done: workoutExercise.done,
      })),
    }))
    .sort((left, right) => weekDayRank(left.weekDay) - weekDayRank(right.weekDay));

  res.json(workoutsResponseSchema.parse({ workouts: summaries }));
});

/**
 * @openapi
 * /api/workouts/{weekDay}:
 *   get:
 *     tags: [Workouts]
 *     summary: Lista os exercícios de um treino diário do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: weekDay
 *         required: true
 *         schema:
 *           type: string
 *           enum: [DOMINGO, SEGUNDA, TERCA, QUARTA, QUINTA, SEXTA, SABADO]
 *         description: Dia da semana oficial do treino
 *     responses:
 *       200:
 *         description: Treino diário com exercícios completos ordenados por nome
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 workout:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     weekDay:
 *                       type: string
 *                       enum: [DOMINGO, SEGUNDA, TERCA, QUARTA, QUINTA, SEXTA, SABADO]
 *                     exercises:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           done:
 *                             type: boolean
 *                           exercise:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               force:
 *                                 type: string
 *                                 nullable: true
 *                               level:
 *                                 type: string
 *                               mechanic:
 *                                 type: string
 *                                 nullable: true
 *                               equipment:
 *                                 type: string
 *                                 nullable: true
 *                               primaryMuscles:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               secondaryMuscles:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               instructions:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               category:
 *                                 type: string
 *                               images:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *       401:
 *         description: Token JWT ausente, inválido ou expirado
 *       404:
 *         description: Dia inválido, treino inexistente ou treino de outro usuário
 */
workoutsRouter.get('/:weekDay', requireAuth, async (req, res) => {
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
    where: {
      userId_weekDay: {
        userId: claims.user_id,
        weekDay,
      },
    },
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
        orderBy: {
          exercise: {
            name: 'asc',
          },
        },
      },
    },
  });

  if (!workout) {
    res.status(404).json({ error: 'Treino não encontrado' });
    return;
  }

  res.json(workoutResponseSchema.parse({ workout }));
});

/**
 * @openapi
 * /api/workouts/{weekDay}/exercises:
 *   post:
 *     tags: [Workouts]
 *     summary: Adiciona um exercício ao treino diário do usuário autenticado
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
 *             required: [exerciseId]
 *             properties:
 *               exerciseId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Associação criada com done inicialmente falso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [id, exerciseId, done]
 *               properties:
 *                 id:
 *                   type: integer
 *                 exerciseId:
 *                   type: string
 *                 done:
 *                   type: boolean
 *       400:
 *         description: Corpo da requisição inválido
 *       401:
 *         description: Token JWT ausente, inválido ou expirado
 *       404:
 *         description: Dia, treino ou exercício não encontrado
 *       409:
 *         description: Exercício já existe no treino
 */
workoutsRouter.post('/:weekDay/exercises', requireAuth, async (req, res) => {
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

  const bodyResult = addWorkoutExerciseBodySchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: 'Dados do exercício inválidos' });
    return;
  }

  const workout = await prisma.workout.findUnique({
    where: {
      userId_weekDay: {
        userId: claims.user_id,
        weekDay,
      },
    },
    select: { id: true },
  });

  if (!workout) {
    res.status(404).json({ error: 'Treino não encontrado' });
    return;
  }

  const exercise = await prisma.exercise.findUnique({
    where: { id: bodyResult.data.exerciseId },
    select: { id: true },
  });

  if (!exercise) {
    res.status(404).json({ error: 'Exercício não encontrado' });
    return;
  }

  try {
    const workoutExercise = await prisma.workoutExercise.create({
      data: {
        workoutId: workout.id,
        exerciseId: exercise.id,
        done: false,
      },
      select: { id: true, exerciseId: true, done: true },
    });

    res.status(201).json(workoutExercise);
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ error: 'Exercício já está no treino' });
      return;
    }

    throw error;
  }
});

/**
 * @openapi
 * /api/workouts/{weekDay}/exercises/{exerciseId}:
 *   delete:
 *     tags: [Workouts]
 *     summary: Remove um exercício do treino diário do usuário autenticado
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
 *         description: Identificador do exercício no catálogo
 *     responses:
 *       200:
 *         description: Exercício removido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [deleted]
 *               properties:
 *                 deleted:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Token JWT ausente, inválido ou expirado
 *       404:
 *         description: Dia inválido, associação inexistente ou pertencente a outro usuário
 */
workoutsRouter.delete('/:weekDay/exercises/:exerciseId', requireAuth, async (req, res) => {
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

  const exerciseId = Array.isArray(req.params.exerciseId)
    ? req.params.exerciseId[0]
    : req.params.exerciseId;

  const workoutExercise = await prisma.workoutExercise.findFirst({
    where: {
      exerciseId,
      workout: { userId: claims.user_id, weekDay },
    },
    select: { id: true },
  });

  if (!workoutExercise) {
    res.status(404).json({ error: 'Exercício do treino não encontrado' });
    return;
  }

  await prisma.workoutExercise.delete({ where: { id: workoutExercise.id } });
  res.json({ deleted: true });
});

/**
 * @openapi
 * /api/workouts/{weekDay}/clear:
 *   post:
 *     tags: [Workouts]
 *     summary: Desmarca todos os exercícios de um treino diário
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: weekDay
 *         required: true
 *         schema:
 *           type: string
 *           enum: [DOMINGO, SEGUNDA, TERCA, QUARTA, QUINTA, SEXTA, SABADO]
 *     responses:
 *       200:
 *         description: Quantidade de associações desmarcadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [cleared]
 *               properties:
 *                 cleared:
 *                   type: integer
 *       401:
 *         description: Token JWT ausente, inválido ou expirado
 *       404:
 *         description: Dia inválido ou treino inexistente
 */
workoutsRouter.post('/:weekDay/clear', requireAuth, async (req, res) => {
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
    where: {
      userId_weekDay: {
        userId: claims.user_id,
        weekDay,
      },
    },
    select: { id: true },
  });

  if (!workout) {
    res.status(404).json({ error: 'Treino não encontrado' });
    return;
  }

  const result = await prisma.workoutExercise.updateMany({
    where: { workoutId: workout.id },
    data: { done: false },
  });

  res.json({ cleared: result.count });
});
