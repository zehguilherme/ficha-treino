import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { exercisesQuerySchema } from '../validators/exercises.js';
import { exercisesResponseSchema, type ExerciseDetails } from '../validators/responses.js';

type ExerciseSearchCount = {
  total: number;
};

export const exercisesRouter = Router();

/**
 * @openapi
 * /api/exercises:
 *   get:
 *     tags: [Exercises]
 *     summary: Busca exercícios por nome
 *     description: A busca ignora diferenças entre maiúsculas, minúsculas e acentos.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: false
 *         schema:
 *           type: string
 *         description: Termo de busca; vazio retorna o catálogo a partir do primeiro exercício
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: offset
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *     responses:
 *       200:
 *         description: Exercícios correspondentes à busca e total antes da paginação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [items, total]
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     required: [id, name, level, primaryMuscles, secondaryMuscles, instructions, category, images]
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       force:
 *                         type: string
 *                         nullable: true
 *                       level:
 *                         type: string
 *                       mechanic:
 *                         type: string
 *                         nullable: true
 *                       equipment:
 *                         type: string
 *                         nullable: true
 *                       primaryMuscles:
 *                         type: array
 *                         items:
 *                           type: string
 *                       secondaryMuscles:
 *                         type: array
 *                         items:
 *                           type: string
 *                       instructions:
 *                         type: array
 *                         items:
 *                           type: string
 *                       category:
 *                         type: string
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                 total:
 *                   type: integer
 *                   minimum: 0
 *       400:
 *         description: Parâmetros de paginação inválidos
 *       401:
 *         description: Token JWT ausente, inválido ou expirado
 */
exercisesRouter.get('/', requireAuth, async (req, res) => {
  const parsedQuery = exercisesQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    res.status(400).json({ error: 'Parâmetros de busca inválidos' });
    return;
  }

  const { q, limit, offset } = parsedQuery.data;
  const searchPattern = '%' + q.trim() + '%';
  const [items, countRows] = await Promise.all([
    prisma.$queryRaw<ExerciseDetails[]>`
      SELECT
        id,
        name,
        force,
        level,
        mechanic,
        equipment,
        primary_muscles AS "primaryMuscles",
        secondary_muscles AS "secondaryMuscles",
        instructions,
        category,
        images
      FROM exercises
      WHERE unaccent(name) ILIKE unaccent(${searchPattern})
      ORDER BY name ASC, id ASC
      LIMIT ${limit}
      OFFSET ${offset}
    `,
    prisma.$queryRaw<ExerciseSearchCount[]>`
      SELECT COUNT(*)::int AS total
      FROM exercises
      WHERE unaccent(name) ILIKE unaccent(${searchPattern})
    `,
  ]);

  res.json(exercisesResponseSchema.parse({ items, total: countRows[0]?.total ?? 0 }));
});
