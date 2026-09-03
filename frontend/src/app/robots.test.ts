import robots from './robots';

describe('robots', () => {
  /**
   * Crawlers can access public content but not authenticated routes.
   * Assert: rules block private route prefixes and point to the sitemap.
   */
  test('allows public pages and blocks private routes', () => {
    expect(robots()).toEqual({
      rules: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/dashboard', '/workout/', '/account', '/auth/'],
        },
      ],
      sitemap: 'https://fichatreino.vercel.app/sitemap.xml',
    });
  });
});
