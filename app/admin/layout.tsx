import Link from 'next/link';
import { cookies } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { FlowLogoMark } from '@/components/brand/flow-logo';
import { requireCourseStaff } from '@/lib/admin/require-staff';
import type { Locale } from '@/i18n/routing';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

const navLinkClass =
  'rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground';

const navLinkButtonClass =
  'rounded-full border border-border/45 bg-background/80 px-3 py-1 text-xs font-medium text-foreground shadow-none backdrop-blur-sm transition-colors hover:bg-muted/40';

/** Matches middleware `resolveLocale` — admin routes are outside `[locale]` so intl context must be provided here. */
async function localeForAdmin(): Promise<Locale> {
  const jar = await cookies();
  const fromCookie = jar.get('NEXT_LOCALE')?.value;
  if (fromCookie === 'en' || fromCookie === 'es') return fromCookie;
  return routing.defaultLocale;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCourseStaff();
  const locale = await localeForAdmin();
  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div
        data-admin-root
        className="relative min-h-screen bg-[#fbf7f0] text-stone-950 [--admin-lesson-sticky-top:4.75rem] sm:[--admin-lesson-sticky-top:2.875rem]"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_12%,rgba(255,219,171,0.35),transparent_26rem),radial-gradient(circle_at_82%_8%,rgba(196,181,253,0.22),transparent_28rem),linear-gradient(180deg,#fffaf2_0%,#f8f0e6_48%,#fbf7f0_100%)]"
          aria-hidden
        />
        <header
          className="fixed inset-x-0 top-[var(--admin-preview-ribbon-h,0px)] z-[80] border-b border-border/25 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55"
          title={`${user.email} · ${user.role}`}
        >
          <div className="flex h-11 w-full items-center justify-between gap-3 px-3 sm:gap-6 sm:px-5 lg:px-8">
            <Link
              href="/admin"
              className="flex min-w-0 shrink items-center gap-2.5 transition-opacity hover:opacity-85"
            >
              <FlowLogoMark
                size={28}
                fetchPriority="high"
                className="size-7 shrink-0"
              />
              <span className="flex min-w-0 items-baseline gap-2 leading-none">
                <span className="truncate text-[13px] font-semibold tracking-tight text-foreground">
                  Flow Guide
                </span>
                <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:inline">
                  Creator
                </span>
              </span>
            </Link>
            <nav
              className="-mr-1 flex max-w-[min(100%,calc(100vw-11rem))] shrink-0 items-center gap-0.5 overflow-x-auto pb-px [-ms-overflow-style:none] [scrollbar-width:none] sm:max-w-none sm:gap-1 [&::-webkit-scrollbar]:hidden"
              aria-label="Creator hub"
            >
              <Link href="/admin" className={navLinkClass}>
                Overview
              </Link>
              <Link href="/admin/courses" className={navLinkClass}>
                Courses
              </Link>
              <Link href="/admin/media" className={navLinkClass}>
                <span className="sm:hidden">Media</span>
                <span className="hidden sm:inline">Media library</span>
              </Link>
              <Link href="/dashboard/courses" className={`${navLinkButtonClass} ml-1 sm:ml-2`}>
                Learner app
              </Link>
            </nav>
          </div>
        </header>
        <main className="w-full max-w-none overflow-visible px-4 pb-8 pt-[calc(var(--admin-preview-ribbon-h,0px)+var(--admin-lesson-sticky-top,2.875rem))] sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </NextIntlClientProvider>
  );
}
