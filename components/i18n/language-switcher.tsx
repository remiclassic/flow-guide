'use client';

import type { Route } from 'next';
import NextLink from 'next/link';
import { memo, Suspense } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname as useNextPathname, useSearchParams } from 'next/navigation';
import { routing } from '@/i18n/routing';

function LanguageSwitcherInner({ compact }: { compact?: boolean }) {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const fullPath = useNextPathname();
  const t = useTranslations('languageSwitcher');

  const pathWithoutLocale =
    fullPath.replace(/^\/(es|en)(?=\/|$)/, '') || '/';
  const qs = searchParams?.toString();
  const suffix = `${pathWithoutLocale.startsWith('/') ? pathWithoutLocale : `/${pathWithoutLocale}`}${qs ? `?${qs}` : ''}`;

  const inactiveClass = compact
    ? 'rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200 text-muted-foreground hover:text-foreground'
    : 'rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors duration-200 text-muted-foreground hover:text-foreground';
  const activeClass = compact
    ? 'rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200 pointer-events-none bg-foreground text-background'
    : 'rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors duration-200 pointer-events-none bg-stone-950 text-white shadow-sm';

  return (
    <div
      className={
        compact
          ? 'flex items-center rounded-md border border-border/40 bg-muted/25 p-px'
          : 'flex items-center rounded-full border border-border/90 bg-card/85 p-0.5 shadow-card-soft backdrop-blur-sm'
      }
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

export const LanguageSwitcher = memo(function LanguageSwitcher({
  compact,
}: {
  compact?: boolean;
}) {
  return (
    <Suspense
      fallback={
        <div
          className={
            compact
              ? 'h-[22px] min-w-[3.75rem] animate-pulse rounded-md bg-muted/60'
              : 'h-[26px] min-w-[4.5rem] animate-pulse rounded-full bg-muted/80'
          }
          aria-hidden
        />
      }
    >
      <LanguageSwitcherInner compact={compact} />
    </Suspense>
  );
});
