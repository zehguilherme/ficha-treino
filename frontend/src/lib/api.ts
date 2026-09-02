import axios, { type AxiosError } from 'axios';
import { clearSession, getSession } from './auth';
import {
  addWorkoutExerciseResponseSchema,
  accountDeletionResponseSchema,
  clearWorkoutResponseSchema,
  currentUserResponseSchema,
  exercisesResponseSchema,
  googleAuthResponseSchema,
  removeWorkoutExerciseResponseSchema,
  workoutResponseSchema,
  workoutsResponseSchema,
  type CurrentUser,
  type AddWorkoutExerciseResponse,
  type ClearWorkoutResponse,
  type ExercisesResponse,
  type GoogleAuthResponse,
  type WorkoutResponse,
  type WorkoutsResponse,
  type ToggleWorkoutExerciseResponse,
  type RemoveWorkoutExerciseResponse,
  type AccountDeletionResponse,
  toggleWorkoutExerciseResponseSchema,
} from '@/schemas/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface ExerciseFilters {
  category?: string;
  equipment?: string;
  level?: string;
  force?: string;
  mechanic?: string;
  primaryMuscle?: string;
  secondaryMuscle?: string;
}

const selectedExerciseFilters = (filters?: ExerciseFilters): ExerciseFilters => {
  const selected: ExerciseFilters = {};
  if (filters?.category) selected.category = filters.category;
  if (filters?.equipment) selected.equipment = filters.equipment;
  if (filters?.level) selected.level = filters.level;
  if (filters?.force) selected.force = filters.force;
  if (filters?.mechanic) selected.mechanic = filters.mechanic;
  if (filters?.primaryMuscle) selected.primaryMuscle = filters.primaryMuscle;
  if (filters?.secondaryMuscle) selected.secondaryMuscle = filters.secondaryMuscle;
  return selected;
};

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = getSession();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearSession();
      window.location.replace(new URL('/login', window.location.origin).toString());
    }
    return Promise.reject(error);
  },
);

export const getExercises = async (
  query: string,
  limit = 20,
  offset = 0,
  signal?: AbortSignal,
  filters?: ExerciseFilters,
): Promise<ExercisesResponse> =>
  exercisesResponseSchema.parse(
    (
      await api.get('/api/exercises', {
        params: {
          q: query,
          limit,
          offset,
          ...selectedExerciseFilters(filters),
        },
        signal,
      })
    ).data,
  );

export const exchangeGoogleCode = async (code: string): Promise<GoogleAuthResponse> =>
  googleAuthResponseSchema.parse((await api.post('/api/auth/google', { code })).data);

export const getCurrentUser = async (): Promise<CurrentUser> =>
  currentUserResponseSchema.parse((await api.get('/api/auth/me')).data);

export const getWorkouts = async (): Promise<WorkoutsResponse> =>
  workoutsResponseSchema.parse((await api.get('/api/workouts')).data);

export const getWorkout = async (weekDay: string): Promise<WorkoutResponse> =>
  workoutResponseSchema.parse((await api.get(`/api/workouts/${encodeURIComponent(weekDay)}`)).data);

export const addWorkoutExercise = async (
  weekDay: string,
  exerciseId: string,
): Promise<AddWorkoutExerciseResponse> =>
  addWorkoutExerciseResponseSchema.parse(
    (await api.post(`/api/workouts/${encodeURIComponent(weekDay)}/exercises`, { exerciseId })).data,
  );

export const toggleWorkoutExercise = async (
  workoutExerciseId: number,
): Promise<ToggleWorkoutExerciseResponse> =>
  toggleWorkoutExerciseResponseSchema.parse(
    (await api.patch(`/api/workout-exercises/${workoutExerciseId}`)).data,
  );

export const clearWorkout = async (weekDay: string): Promise<ClearWorkoutResponse> =>
  clearWorkoutResponseSchema.parse(
    (await api.post(`/api/workouts/${encodeURIComponent(weekDay)}/clear`)).data,
  );

export const removeWorkoutExercise = async (
  weekDay: string,
  exerciseId: string,
): Promise<RemoveWorkoutExerciseResponse> =>
  removeWorkoutExerciseResponseSchema.parse(
    (
      await api.delete(
        `/api/workouts/${encodeURIComponent(weekDay)}/exercises/${encodeURIComponent(exerciseId)}`,
      )
    ).data,
  );

export const deleteAccount = async (): Promise<AccountDeletionResponse> =>
  accountDeletionResponseSchema.parse((await api.delete('/api/account')).data);
