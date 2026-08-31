import { z } from 'zod';

const categoryValues = [
  'alongamento',
  'cardio',
  'forca',
  'levantamento-olimpico',
  'pliometria',
  'powerlifting',
  'strongman',
] as const;

const equipmentValues = [
  'barra',
  'barra-w',
  'bola-de-exercicio',
  'bola-medicinal',
  'cabo',
  'faixas',
  'halteres',
  'kettlebell',
  'maquina',
  'outros',
  'peso-do-corpo',
  'rolo-de-espuma',
] as const;

const levelValues = ['avancado', 'iniciante', 'intermediario'] as const;
const forceValues = ['pull', 'push', 'static'] as const;
const mechanicValues = ['composto', 'isolado'] as const;
const muscleValues = [
  'abdominais',
  'abdutores',
  'adutores',
  'antebracos',
  'biceps',
  'dorsais',
  'gluteos',
  'inferior-das-costas',
  'isquiotibiais',
  'meio-das-costas',
  'ombros',
  'panturrilhas',
  'peito',
  'pescoco',
  'quadriceps',
  'trapezio',
  'triceps',
] as const;

const normalizeFilter = (value: unknown): unknown[] => {
  const values = value === undefined ? [] : Array.isArray(value) ? value : [value];
  return values
    .filter((item: unknown) => typeof item !== 'string' || item.trim().length > 0)
    .map((item: unknown) => (typeof item === 'string' ? item.trim() : item));
};

const categoryFilter = z.preprocess(normalizeFilter, z.array(z.enum(categoryValues)));
const equipmentFilter = z.preprocess(normalizeFilter, z.array(z.enum(equipmentValues)));
const levelFilter = z.preprocess(normalizeFilter, z.array(z.enum(levelValues)));
const forceFilter = z.preprocess(normalizeFilter, z.array(z.enum(forceValues)));
const mechanicFilter = z.preprocess(normalizeFilter, z.array(z.enum(mechanicValues)));
const primaryMuscleFilter = z.preprocess(normalizeFilter, z.array(z.enum(muscleValues)));
const secondaryMuscleFilter = z.preprocess(normalizeFilter, z.array(z.enum(muscleValues)));

export const exercisesQuerySchema = z.object({
  q: z.string().optional().default(''),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  category: categoryFilter,
  equipment: equipmentFilter,
  level: levelFilter,
  force: forceFilter,
  mechanic: mechanicFilter,
  primaryMuscle: primaryMuscleFilter,
  secondaryMuscle: secondaryMuscleFilter,
});

export type ExercisesQuery = z.infer<typeof exercisesQuerySchema>;
