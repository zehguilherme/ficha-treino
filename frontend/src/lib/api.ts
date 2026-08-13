import axios, { type AxiosError } from 'axios';
import { clearSession, getSession } from './auth';
import {
  currentUserResponseSchema,
  googleAuthResponseSchema,
  workoutsResponseSchema,
  type CurrentUser,
  type GoogleAuthResponse,
  type WorkoutsResponse,
} from '@/schemas/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

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

export const exchangeGoogleCode = async (code: string): Promise<GoogleAuthResponse> =>
  googleAuthResponseSchema.parse((await api.post('/api/auth/google', { code })).data);

export const getCurrentUser = async (): Promise<CurrentUser> =>
  currentUserResponseSchema.parse((await api.get('/api/auth/me')).data);

export const getWorkouts = async (): Promise<WorkoutsResponse> =>
  workoutsResponseSchema.parse((await api.get('/api/workouts')).data);
