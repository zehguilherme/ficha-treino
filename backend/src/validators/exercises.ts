import { z } from 'zod';

export const exercisesQuerySchema = z.object({
  q: z.string().optional().default(''),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ExercisesQuery = z.infer<typeof exercisesQuerySchema>;
