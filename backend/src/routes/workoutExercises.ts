import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { setWorkoutExerciseDoneBodySchema } from '../validators/workouts.js';

export const workoutExercisesRouter = Router();

/**
 * @openapi
 * /api/workout-exercises/{id}:
 *   patch:
 *     tags: [Workouts]
 *     summary: Define o estado de conclusão de um exercício do treino
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da associação entre treino e exercício
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [done]
 *             properties:
 *               done:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Associação atualizada
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
 *       401:
 *         description: Token JWT ausente, inválido ou expirado
 *       400:
 *         description: Campo done ausente ou inválido
 *       404:
 *         description: Associação inexistente ou pertencente a outro usuário
 */
workoutExercisesRouter.patch('/:id', requireAuth, async (req, res) => {
  const claims = req.user;
  if (!claims) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
    return;
  }

  const body = setWorkoutExerciseDoneBodySchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: 'Estado de conclusão inválido' });
    return;
  }

  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    res.status(404).json({ error: 'Exercício do treino não encontrado' });
    return;
  }

  const workoutExercise = await prisma.workoutExercise.findUnique({
    where: { id },
    select: {
      id: true,
      exerciseId: true,
      done: true,
      workout: { select: { userId: true } },
    },
  });

  if (!workoutExercise || workoutExercise.workout.userId !== claims.user_id) {
    res.status(404).json({ error: 'Exercício do treino não encontrado' });
    return;
  }

  const updatedWorkoutExercise = await prisma.workoutExercise.update({
    where: { id: workoutExercise.id },
    data: { done: body.data.done },
    select: { id: true, exerciseId: true, done: true },
  });

  res.json(updatedWorkoutExercise);
});
