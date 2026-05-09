import { defineRouting } from 'next-intl/routing';

export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale: 'es',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/courses': {
      es: '/cursos',
      en: '/courses'
    },
    '/pricing': {
      es: '/precios',
      en: '/pricing'
    },
    '/sign-in': {
      es: '/iniciar-sesion',
      en: '/sign-in'
    },
    '/sign-up': {
      es: '/registro',
      en: '/sign-up'
    },
    '/legal/terms': {
      es: '/legal/terminos',
      en: '/legal/terms'
    },
    '/legal/privacy': {
      es: '/legal/privacidad',
      en: '/legal/privacy'
    }
  }
});
