import sitemap from './sitemap';

describe('sitemap', () => {
  /**
   * Public URLs are included in the sitemap.
   * Assert: only the canonical homepage is listed.
   */
  test('lists only the public homepage', () => {
    expect(sitemap()).toEqual([
      {
        url: 'https://fichatreino.vercel.app',
      },
    ]);
  });
});
