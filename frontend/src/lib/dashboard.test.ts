import { getExercisePreview, getInitials } from './dashboard';

describe('dashboard helpers', () => {
  test('shows three exercises and the remaining count when a workout has more than four', () => {
    expect(
      getExercisePreview(['Agachamento', 'Leg press', 'Mesa flexora', 'Panturrilha', 'Extensora']),
    ).toEqual({ names: ['Agachamento', 'Leg press', 'Mesa flexora'], remaining: 2 });
  });

  test('shows all exercises when a workout has at most four', () => {
    expect(getExercisePreview(['Supino', 'Remada'])).toEqual({
      names: ['Supino', 'Remada'],
      remaining: 0,
    });
  });

  /**
   * A workout with exactly four exercises fits entirely in the preview.
   * Assert: all four names are shown and no remaining count is reported.
   */
  test('does not report remaining exercises when exactly four are shown', () => {
    const result = getExercisePreview(['A', 'B', 'C', 'D']);

    expect(result).toEqual({ names: ['A', 'B', 'C', 'D'], remaining: 0 });
  });

  test('creates initials from the first and last name', () => {
    expect(getInitials('João Guilherme Silva')).toBe('JS');
    expect(getInitials('')).toBe('U');
  });
});
