import type { MetadataRoute } from 'next';

const base =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/legacy/']
    },
    sitemap: `${base}/sitemap.xml`,
    host: base
  };
}
