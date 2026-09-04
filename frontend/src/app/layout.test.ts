jest.mock('@vercel/analytics/next', () => ({ Analytics: () => null }));
jest.mock('next/font/google', () => ({ Inter: () => ({ variable: 'mock-font' }) }));
jest.mock('./globals.css', () => ({}));

import { metadata } from './layout';

describe('root metadata', () => {
  /**
   * The public site exposes a canonical origin for search engines.
   * Assert: metadata base and homepage canonical use the production URL.
   */
  test('defines the production canonical URL', () => {
    expect(metadata.metadataBase?.toString()).toBe('https://fichatreino.vercel.app/');
    expect(metadata.alternates?.canonical).toBe('/');
    expect(metadata.openGraph).toMatchObject({
      type: 'website',
      locale: 'pt_BR',
      url: '/',
      siteName: 'Ficha de Treino',
      title: 'Ficha de Treino — Seu treino organizado',
      description: 'Organize seus treinos, acompanhe seu progresso e evolua com consistência.',
    });
    expect(metadata.description).toBe(
      'Organize seus treinos, acompanhe seu progresso e evolua com consistência.',
    );
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' });
  });
});
