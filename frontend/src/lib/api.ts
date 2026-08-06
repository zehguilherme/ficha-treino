import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const api = axios.create({ baseURL: API_BASE_URL });

export interface GoogleAuthResponse {
  token: string;
  name: string;
  email: string;
}

export const exchangeGoogleCode = (code: string): Promise<GoogleAuthResponse> =>
  api.post<GoogleAuthResponse>('/api/auth/google', { code }).then((response) => response.data);
