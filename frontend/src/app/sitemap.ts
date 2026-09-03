import type { MetadataRoute } from 'next';

const sitemap = (): MetadataRoute.Sitemap => [{ url: 'https://fichatreino.vercel.app' }];

// Next.js metadata routes require a default export.
// eslint-disable-next-line no-restricted-syntax
export default sitemap;
