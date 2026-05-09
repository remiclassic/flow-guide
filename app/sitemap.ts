import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { localizedPublicSegments } from '@/i18n/middleware-paths';
import type { Locale } from '@/i18n/routing';

const base =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000';

function coursesSegment(locale: Locale) {
  return locale === 'es' ? '/cursos' : '/courses';
}

function legalTerms(locale: Locale) {
  return locale === 'es' ? '/legal/terminos' : '/legal/terms';
}

function legalPrivacy(locale: Locale) {
  return locale === 'es' ? '/legal/privacidad' : '/legal/privacy';
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    const L = locale as Locale;
    const segs = localizedPublicSegments(L);

    entries.push({
      url: `${base}/${L}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          es: `${base}/es`,
          en: `${base}/en`
        }
      }
    });

    entries.push({
      url: `${base}/${L}${coursesSegment(L)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          es: `${base}/es/cursos`,
          en: `${base}/en/courses`
        }
      }
    });

    entries.push({
      url: `${base}/${L}${segs.pricing}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          es: `${base}/es/precios`,
          en: `${base}/en/pricing`
        }
      }
    });

    entries.push({
      url: `${base}/${L}${segs.signIn}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3
    });

    entries.push({
      url: `${base}/${L}${segs.signUp}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3
    });

    entries.push({
      url: `${base}/${L}${legalTerms(L)}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2
    });

    entries.push({
      url: `${base}/${L}${legalPrivacy(L)}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2
    });
  }

  return entries;
}
