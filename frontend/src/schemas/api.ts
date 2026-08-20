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

export const weekDaySchema = z.enum([
  'DOMINGO',
  'SEGUNDA',
  'TERCA',
  'QUARTA',
  'QUINTA',
  'SEXTA',
  'SABADO',
]);

export const workoutSummarySchema = z.object({
  id: z.number().int(),
  weekDay: weekDaySchema,
  exerciseCount: z.number().int().nonnegative(),
  exerciseNames: z.array(z.string()),
});

export const workoutsResponseSchema = z.object({
  workouts: z.array(workoutSummarySchema),
});

export const exerciseDetailsSchema = z.object({
  id: z.string(),
  name: z.string(),
  force: z.string().nullable(),
  level: z.string(),
  mechanic: z.string().nullable(),
  equipment: z.string().nullable(),
  primaryMuscles: z.array(z.string()),
  secondaryMuscles: z.array(z.string()),
  instructions: z.array(z.string()),
  category: z.string(),
  images: z.array(z.string()),
});

export const exercisesResponseSchema = z.object({
  items: z.array(exerciseDetailsSchema),
  total: z.number().int().nonnegative(),
});

export const workoutExerciseSchema = z.object({
  id: z.number().int(),
  done: z.boolean(),
  exercise: exerciseDetailsSchema,
});

export const workoutResponseSchema = z.object({
  workout: z.object({
    id: z.number().int(),
    weekDay: weekDaySchema,
    exercises: z.array(workoutExerciseSchema),
  }),
});

export const addWorkoutExerciseResponseSchema = z.object({
  id: z.number().int(),
  exerciseId: z.string(),
  done: z.boolean(),
});

export const clearWorkoutResponseSchema = z.object({
  cleared: z.number().int().nonnegative(),
});

export const removeWorkoutExerciseResponseSchema = z.object({
  deleted: z.literal(true),
});

export const toggleWorkoutExerciseResponseSchema = z.object({
  id: z.number().int(),
  exerciseId: z.string(),
  done: z.boolean(),
});

export type GoogleAuthResponse = z.infer<typeof googleAuthResponseSchema>;
export type CurrentUser = z.infer<typeof currentUserResponseSchema>;
export type WeekDay = z.infer<typeof weekDaySchema>;
export type WorkoutsResponse = z.infer<typeof workoutsResponseSchema>;
export type WorkoutResponse = z.infer<typeof workoutResponseSchema>;
export type AddWorkoutExerciseResponse = z.infer<typeof addWorkoutExerciseResponseSchema>;
export type ClearWorkoutResponse = z.infer<typeof clearWorkoutResponseSchema>;
export type RemoveWorkoutExerciseResponse = z.infer<typeof removeWorkoutExerciseResponseSchema>;
export type ExerciseDetails = z.infer<typeof exerciseDetailsSchema>;
export type ExercisesResponse = z.infer<typeof exercisesResponseSchema>;
export type ToggleWorkoutExerciseResponse = z.infer<typeof toggleWorkoutExerciseResponseSchema>;
