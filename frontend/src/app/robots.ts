import type { MetadataRoute } from 'next';

const robots = (): MetadataRoute.Robots => ({
  rules: [
    {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/workout/', '/account', '/auth/'],
    },
  ],
  sitemap: 'https://fichatreino.vercel.app/sitemap.xml',
});

// Next.js metadata routes require a default export.
// eslint-disable-next-line no-restricted-syntax
export default robots;
