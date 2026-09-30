import { z } from 'zod';
import { muscleValues } from './exercises.js';

export const customExerciseBodySchema = z.object({
  name: z.string().trim().min(2).max(255),
  primaryMuscle: z.enum(muscleValues),
});

export type CustomExerciseBody = z.infer<typeof customExerciseBodySchema>;
