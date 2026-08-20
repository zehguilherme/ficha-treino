import { z } from 'zod';

export const addWorkoutExerciseBodySchema = z.object({
  exerciseId: z.string().min(1),
});

export type AddWorkoutExerciseBody = z.infer<typeof addWorkoutExerciseBodySchema>;
