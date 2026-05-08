'use client';

import type { Route } from 'next';
import NextLink from 'next/link';
import { memo, Suspense } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname as useNextPathname, useSearchParams } from 'next/navigation';
import { routing } from '@/i18n/routing';

function LanguageSwitcherInner() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const fullPath = useNextPathname();
  const t = useTranslations('languageSwitcher');

  const pathWithoutLocale =
    fullPath.replace(/^\/(es|en)(?=\/|$)/, '') || '/';
  const qs = searchParams?.toString();
  const suffix = `${pathWithoutLocale.startsWith('/') ? pathWithoutLocale : `/${pathWithoutLocale}`}${qs ? `?${qs}` : ''}`;

  const inactiveClass =
    'rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors duration-200 text-muted-foreground hover:text-foreground';
  const activeClass =
    'rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors duration-200 pointer-events-none bg-stone-950 text-white shadow-sm';

  return (
    <div
      className="flex items-center rounded-full border border-border/90 bg-card/85 p-0.5 shadow-card-soft backdrop-blur-sm"
      role="group"
      aria-label={t('label')}
    >
      {routing.locales.map((loc) =>
        loc === locale ? (
          <span key={loc} className={activeClass} aria-current="true">
            {loc === 'es' ? t('es') : t('en')}
          </span>
        ) : (
          <NextLink
            key={loc}
            href={`/${loc}${suffix === '/' ? '' : suffix}` as Route}
            prefetch={false}
            className={inactiveClass}
          >
            {loc === 'es' ? t('es') : t('en')}
          </NextLink>
        )
      )}
    </div>
  );
}

export const LanguageSwitcher = memo(function LanguageSwitcher() {
  return (
    <Suspense
      fallback={
        <div
          className="h-[26px] min-w-[4.5rem] animate-pulse rounded-full bg-muted/80"
          aria-hidden
        />
      }
    >
      <LanguageSwitcherInner />
    </Suspense>
  );
});
