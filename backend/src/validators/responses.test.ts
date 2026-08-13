import {
  currentUserResponseSchema,
  googleAuthResponseSchema,
  workoutsResponseSchema,
} from './responses.js';

describe('API response schemas', () => {
  /**
   * Route responses cross the HTTP contract with required fields and constrained weekdays.
   * Mock: none; malformed literals exercise the local Zod schemas directly.
   * Assert: malformed auth, user and workouts payloads are rejected.
   */
  test('rejects malformed response payloads', () => {
    expect(() => googleAuthResponseSchema.parse({ token: '', name: 'João' })).toThrow();
    expect(() =>
      currentUserResponseSchema.parse({ name: 'João', email: 'joao@teste.com' }),
    ).toThrow();
    expect(() =>
      workoutsResponseSchema.parse({
        workouts: [
          {
            id: 1,
            weekDay: 'FERIADO',
            exerciseCount: -1,
            exerciseNames: [],
          },
        ],
      }),
    ).toThrow();
  });
});
