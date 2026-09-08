import { getWeekDayFromSlug, getWeekDaySlug } from './weekDays';

describe('week day URL slugs', () => {
  /**
   * A valid lowercase slug must resolve to the internal API enum.
   * Assert: ASCII slugs map to the corresponding uppercase weekday.
   */
  test('maps lowercase slugs to internal weekdays', () => {
    expect(getWeekDayFromSlug('quarta')).toBe('QUARTA');
    expect(getWeekDayFromSlug('terca')).toBe('TERCA');
  });

  /**
   * Uppercase and unknown values must not be normalized into valid routes.
   * Assert: invalid route values resolve to null.
   */
  test('rejects uppercase and unknown slugs', () => {
    expect(getWeekDayFromSlug('QUARTA')).toBeNull();
    expect(getWeekDayFromSlug('quarta-feira')).toBeNull();
  });

  /**
   * Internal weekdays are serialized into stable lowercase route segments.
   * Assert: the API enum becomes its canonical URL slug.
   */
  test('maps internal weekdays to lowercase slugs', () => {
    expect(getWeekDaySlug('QUARTA')).toBe('quarta');
    expect(getWeekDaySlug('TERCA')).toBe('terca');
  });
});
