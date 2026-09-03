import { generateMetadata } from './layout';

describe('Workout day metadata', () => {
  /**
   * Valid route parameter resolves to the localized weekday title.
   * Assert: metadata contains the weekday as the page context.
   */
  test('returns the weekday for a valid route', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ weekDay: 'SEGUNDA' }) });

    expect(metadata).toEqual({ title: 'Segunda-feira' });
  });

  /**
   * Invalid route parameter gets a contextual fallback title.
   * Assert: metadata identifies that the requested workout does not exist.
   */
  test('returns a not-found context for an invalid route', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ weekDay: 'INVALIDO' }) });

    expect(metadata).toEqual({ title: 'Treino não encontrado' });
  });
});
