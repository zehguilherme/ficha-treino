import { getExercisePreview, getInitials } from './dashboard';

describe('dashboard helpers', () => {
  test('shows eight exercises and the remaining count when a workout has more than eight', () => {
    const exercises = [
      'Agachamento',
      'Leg press',
      'Mesa flexora',
      'Panturrilha',
      'Extensora',
      'Supino',
      'Remada',
      'Rosca',
      'Elevação',
    ].map((name) => ({ name, done: false }));
    expect(getExercisePreview(exercises)).toEqual({
      exercises: exercises.slice(0, 8),
      remaining: 1,
    });
  });

  test('shows all exercises when a workout has at most four', () => {
    const exercises = ['Supino', 'Remada'].map((name) => ({ name, done: false }));
    expect(getExercisePreview(exercises)).toEqual({
      exercises,
      remaining: 0,
    });
  });

  /**
   * A workout with exactly four exercises fits entirely in the preview.
   * Assert: all four names are shown and no remaining count is reported.
   */
  test('does not report remaining exercises when exactly four are shown', () => {
    const exercises = ['A', 'B', 'C', 'D'].map((name) => ({ name, done: false }));
    const result = getExercisePreview(exercises);

    expect(result).toEqual({ exercises, remaining: 0 });
  });

  test('creates initials from the first and last name', () => {
    expect(getInitials('João Guilherme Silva')).toBe('JS');
    expect(getInitials('')).toBe('U');
  });
});
