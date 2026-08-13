import { Router } from 'express';
import { prisma } from '../db.js';
import { WeekDay } from '../generated/prisma/client.js';
import { requireAuth } from '../middleware/auth.js';
import { workoutsResponseSchema, type WorkoutSummary } from '../validators/responses.js';

const WEEK_DAY_ORDER = [
  WeekDay.DOMINGO,
  WeekDay.SEGUNDA,
  WeekDay.TERÇA,
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
 *                         enum: [DOMINGO, SEGUNDA, TERÇA, QUARTA, QUINTA, SEXTA, SABADO]
 *                       exerciseCount:
 *                         type: integer
 *                       exerciseNames:
 *                         type: array
 *                         items:
 *                           type: string
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
      exerciseNames: workout.exercises.map((workoutExercise) => workoutExercise.exercise.name),
    }))
    .sort((left, right) => weekDayRank(left.weekDay) - weekDayRank(right.weekDay));

  res.json(workoutsResponseSchema.parse({ workouts: summaries }));
});
