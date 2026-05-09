import { redirect as nextRedirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';

/** Path + optional query (dashboard and app paths allowed — not limited to next-intl pathnames). */
export type LocalizedRedirectHref =
  | string
  | {
      pathname: string;
      query?: Record<string, string | string[] | undefined>;
    };

/** Supports `redirectLocalized('/path')` or `redirectLocalized({ href: ... })`. */
export type RedirectLocalizedInput =
  | LocalizedRedirectHref
  | { href: LocalizedRedirectHref };

function buildPrefixedPath(locale: string, href: LocalizedRedirectHref): string {
  const pathname =
    typeof href === 'string' ? href : href.pathname;
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const prefixed =
    path.startsWith(`/${locale}/`) || path === `/${locale}`
      ? path
      : `/${locale}${path}`;

  if (typeof href === 'string' || !href.query || Object.keys(href.query).length === 0) {
    return prefixed;
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(href.query)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, item);
    } else {
      params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `${prefixed}?${qs}` : prefixed;
}

/** Server-only redirect to a locale-prefixed URL (supports `/dashboard/**` and other app paths). */
export async function redirectLocalized(
  input: RedirectLocalizedInput
): Promise<never> {
  const href = typeof input === 'object' && input !== null && 'href' in input
    ? input.href
    : input;
  const locale = await getLocale();
  nextRedirect(buildPrefixedPath(locale, href));
}
