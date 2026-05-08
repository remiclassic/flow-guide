import type { Locale } from './routing';

/** Segments after `/${locale}` — keep aligned with `routing.pathnames` in `./routing.ts`. */
export function localizedPublicSegments(locale: Locale) {
  return {
    signIn: locale === 'es' ? '/iniciar-sesion' : '/sign-in',
    signUp: locale === 'es' ? '/registro' : '/sign-up',
    pricing: locale === 'es' ? '/precios' : '/pricing'
  } as const;
}

export function localeDashboardPrefix(locale: Locale) {
  return `/${locale}/dashboard`;
}
