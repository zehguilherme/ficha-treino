import { AxiosError } from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { api, addWorkoutExercise, getCurrentUser, getExercises, getWorkouts } from './api';
import { setSession } from './auth';

const TOKEN = 'jwt-token';

const mockSuccessAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => ({
  data: {},
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
});

const mockUnauthorizedAdapter = async (
  config: InternalAxiosRequestConfig,
): Promise<AxiosResponse> => {
  const response: AxiosResponse = {
    data: {},
    status: 401,
    statusText: 'Unauthorized',
    headers: {},
    config,
  };
  throw new AxiosError(
    'Request failed with status code 401',
    AxiosError.ERR_BAD_REQUEST,
    config,
    undefined,
    response,
  );
};

const mockInvalidPayloadAdapter = async (
  config: InternalAxiosRequestConfig,
): Promise<AxiosResponse> => ({
  data: { unexpected: true },
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
});

describe('api axios instance', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /**
   * Request interceptor attaches the JWT when a session token is stored.
   * Mock: setSession(TOKEN), custom adapter resolving with 200.
   * Assert: outgoing request carries `Authorization: Bearer TOKEN`.
   */
  test('attaches Authorization header when a session token exists', async () => {
    setSession(TOKEN);
    api.defaults.adapter = mockSuccessAdapter;
    const response = await api.get('/api/test');
    expect(response.config.headers.Authorization).toBe(`Bearer ${TOKEN}`);
  });

  /**
   * Request interceptor leaves the header unset when there is no session.
   * Mock: localStorage cleared in beforeEach, custom adapter resolving with 200.
   * Assert: outgoing request has no Authorization header.
   */
  test('does not attach Authorization header without a session token', async () => {
    api.defaults.adapter = mockSuccessAdapter;
    const response = await api.get('/api/test');
    expect(response.config.headers.Authorization).toBeUndefined();
  });

  /**
   * Response interceptor clears the session on 401.
   * Mock: setSession(TOKEN), custom adapter throwing an AxiosError with status 401.
   * Assert: request rejects and localStorage token is removed.
   */
  test('clears the session when the API responds 401', async () => {
    setSession(TOKEN);
    api.defaults.adapter = mockUnauthorizedAdapter;
    await expect(api.get('/api/test')).rejects.toMatchObject({ response: { status: 401 } });
    expect(localStorage.getItem('ficha_treino_token')).toBeNull();
  });

  /**
   * API trust boundary receives payloads that do not match the documented contracts.
   * Mock: custom adapter resolves with an unrelated object for both endpoints.
   * Assert: current-user and workouts requests reject instead of leaking invalid data.
   */
  test('rejects invalid API response payloads', async () => {
    api.defaults.adapter = mockInvalidPayloadAdapter;

    await expect(getCurrentUser()).rejects.toBeDefined();
    await expect(getWorkouts()).rejects.toBeDefined();
  });

  /**
   * Exercise search sends the query and pagination to the backend.
   * Mock: adapter returns a valid exercise-search response.
   * Assert: the typed client exposes the parsed response and serializes query params.
   */
  test('gets exercises with search parameters', async () => {
    api.defaults.adapter = async (config: InternalAxiosRequestConfig) => ({
      data: { items: [], total: 0 },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });

    const response = await getExercises('tríceps', 20, 0);

    expect(response).toEqual({ items: [], total: 0 });
    expect(api.defaults.adapter).toBeDefined();
  });

  /**
   * Add-exercise client posts the selected catalog item to the current weekday.
   * Mock: adapter returns the documented association payload.
   * Assert: URL, method, body and parsed response match the backend contract.
   */
  test('adds an exercise to a workout', async () => {
    let requestConfig: InternalAxiosRequestConfig | undefined;
    api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
      requestConfig = config;
      return {
        data: { id: 46, exerciseId: 'triceps-pushdown', done: false },
        status: 201,
        statusText: 'Created',
        headers: {},
        config,
      };
    };

    const response = await addWorkoutExercise('TERCA', 'triceps-pushdown');

    expect(response).toEqual({ id: 46, exerciseId: 'triceps-pushdown', done: false });
    expect(requestConfig?.method).toBe('post');
    expect(requestConfig?.url).toBe('/api/workouts/TERCA/exercises');
    expect(requestConfig?.data).toBe(JSON.stringify({ exerciseId: 'triceps-pushdown' }));
  });
});
