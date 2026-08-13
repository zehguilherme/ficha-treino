import { z } from 'zod';

export const googleAuthResponseSchema = z.object({
  token: z.string().min(1),
  name: z.string(),
  email: z.string(),
});

export const currentUserResponseSchema = z.object({
  name: z.string(),
  email: z.string(),
  google_id: z.string(),
});

export const workoutSummarySchema = z.object({
  id: z.number().int(),
  weekDay: z.enum(['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO']),
  exerciseCount: z.number().int().nonnegative(),
  exerciseNames: z.array(z.string()),
});

export const workoutsResponseSchema = z.object({
  workouts: z.array(workoutSummarySchema),
});

export type WorkoutSummary = z.infer<typeof workoutSummarySchema>;
