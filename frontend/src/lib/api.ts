import axios, { type AxiosError } from 'axios';
import { clearSession, getSession } from './auth';

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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export interface GoogleAuthResponse {
  token: string;
  name: string;
  email: string;
}

export const exchangeGoogleCode = (code: string): Promise<GoogleAuthResponse> =>
  api.post<GoogleAuthResponse>('/api/auth/google', { code }).then((response) => response.data);
