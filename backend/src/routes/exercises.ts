import { Router } from 'express';
import { prisma } from '../db.js';
import { Prisma } from '../generated/prisma/client.js';
import { requireAuth } from '../middleware/auth.js';
import { exercisesQuerySchema } from '../validators/exercises.js';
import { exercisesResponseSchema, type ExerciseDetails } from '../validators/responses.js';

type ExerciseSearchCount = {
  total: number;
};

type ExerciseFilters = {
  category: string[];
  equipment: string[];
  level: string[];
  force: string[];
  mechanic: string[];
  primaryMuscle: string[];
  secondaryMuscle: string[];
};

const scalarFilter = (column: string, values: string[]): Prisma.Sql | null =>
  values.length === 0
    ? null
    : Prisma.sql`(${Prisma.join(
        values.map(
          (value) => Prisma.sql`unaccent(lower(${Prisma.raw(column)})) = unaccent(lower(${value}))`,
        ),
        ' OR ',
      )})`;

const muscleFilter = (column: string, values: string[]): Prisma.Sql | null =>
  values.length === 0
    ? null
    : Prisma.sql`(${Prisma.join(
        values.map(
          (value) =>
            Prisma.sql`EXISTS (
              SELECT 1
              FROM unnest(${Prisma.raw(column)}) AS muscle
              WHERE unaccent(lower(muscle)) = unaccent(lower(${value}))
            )`,
        ),
        ' OR ',
      )})`;

const buildExerciseWhere = (q: string, filters: ExerciseFilters): Prisma.Sql => {
  const conditions = [
    Prisma.sql`unaccent(name) ILIKE unaccent(${'%' + q.trim() + '%'})`,
    scalarFilter('category', filters.category),
    scalarFilter('equipment', filters.equipment),
    scalarFilter('level', filters.level),
    scalarFilter('force', filters.force),
    scalarFilter('mechanic', filters.mechanic),
    muscleFilter('primary_muscles', filters.primaryMuscle),
    muscleFilter('secondary_muscles', filters.secondaryMuscle),
  ].filter((condition): condition is Prisma.Sql => condition !== null);

  return Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;
};

export const exercisesRouter = Router();

/**
 * @openapi
 * /api/exercises:
 *   get:
 *     tags: [Exercises]
 *     summary: Busca exercícios por nome e metadados
 *     description: A busca ignora diferenças entre maiúsculas, minúsculas e acentos; filtros repetidos usam OR e filtros diferentes usam AND.
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
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [alongamento, cardio, forca, levantamento-olimpico, pliometria, powerlifting, strongman]
 *         style: form
 *         explode: true
 *         description: Uma ou mais categorias
 *       - in: query
 *         name: equipment
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [barra, barra-w, bola-de-exercicio, bola-medicinal, cabo, faixas, halteres, kettlebell, maquina, outros, peso-do-corpo, rolo-de-espuma]
 *         style: form
 *         explode: true
 *         description: Um ou mais equipamentos
 *       - in: query
 *         name: level
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [avancado, iniciante, intermediario]
 *         style: form
 *         explode: true
 *         description: Um ou mais níveis
 *       - in: query
 *         name: force
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [pull, push, static]
 *         style: form
 *         explode: true
 *         description: Um ou mais tipos de força
 *       - in: query
 *         name: mechanic
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [composto, isolado]
 *         style: form
 *         explode: true
 *         description: Um ou mais tipos de mecânica
 *       - in: query
 *         name: primaryMuscle
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [abdominais, abdutores, adutores, antebracos, biceps, dorsais, gluteos, inferior-das-costas, isquiotibiais, meio-das-costas, ombros, panturrilhas, peito, pescoco, quadriceps, trapezio, triceps]
 *         style: form
 *         explode: true
 *         description: Um ou mais músculos principais
 *       - in: query
 *         name: secondaryMuscle
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [abdominais, abdutores, adutores, antebracos, biceps, dorsais, gluteos, inferior-das-costas, isquiotibiais, meio-das-costas, ombros, panturrilhas, peito, pescoco, quadriceps, trapezio, triceps]
 *         style: form
 *         explode: true
 *         description: Um ou mais músculos secundários
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
 *         description: Parâmetros de busca ou paginação inválidos
 *       401:
 *         description: Token JWT ausente, inválido ou expirado
 */
exercisesRouter.get('/', requireAuth, async (req, res) => {
  const parsedQuery = exercisesQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    res.status(400).json({ error: 'Parâmetros de busca inválidos' });
    return;
  }

  const { q, limit, offset, ...filters } = parsedQuery.data;
  const where = buildExerciseWhere(q, filters);
  const [items, countRows] = await Promise.all([
    prisma.$queryRaw<ExerciseDetails[]>(Prisma.sql`
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
      ${where}
      ORDER BY name ASC, id ASC
      LIMIT ${limit}
      OFFSET ${offset}
    `),
    prisma.$queryRaw<ExerciseSearchCount[]>(Prisma.sql`
      SELECT COUNT(*)::int AS total
      FROM exercises
      ${where}
    `),
  ]);

  res.json(exercisesResponseSchema.parse({ items, total: countRows[0]?.total ?? 0 }));
});
