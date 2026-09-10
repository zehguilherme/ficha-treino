import manifest from './manifest';

describe('web app manifest', () => {
  test('declares the installable Ficha de Treino app', () => {
    const result = manifest();

    expect(result).toMatchObject({
      name: 'Ficha de Treino',
      short_name: 'Ficha de Treino',
      description: 'Organize seus treinos, acompanhe seu progresso e evolua com consistência.',
      start_url: '/',
      display: 'standalone',
      background_color: '#f8fafc',
      theme_color: '#0f172a',
    });
    expect(result.icons).toEqual([
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ]);
  });
});
