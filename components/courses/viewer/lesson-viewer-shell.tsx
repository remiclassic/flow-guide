'use client';

import Link from 'next/link';
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useLessonScrollProgress } from '@/hooks/use-lesson-scroll-progress';
import { LessonAtmosphere } from '@/components/courses/viewer/lesson-atmosphere';
import { LessonBottomNav } from '@/components/courses/viewer/lesson-bottom-nav';
import { LessonHero, type LessonHeroContentProps } from '@/components/courses/viewer/lesson-hero';
import { Progress } from '@/components/ui/progress';

/** Padding inside sidebar scroll regions so the last items clear the fixed lesson bottom nav. */
const SIDEBAR_SCROLL_PADDING =
  'px-3 pt-3 pb-[max(5.5rem,env(safe-area-inset-bottom))]';

type Props = {
  heroContent: LessonHeroContentProps;
  journey: ReactNode;
  companion: ReactNode;
  article: ReactNode;
  previewBanner?: ReactNode;
  previewToolbar?: ReactNode;
  stickyHeaderTopClassName?: string;
  stickyHeaderZClassName?: string;
  courseSlug: string;
  courseOverviewHref: string;
  lessonLessonBasePath?: string;
  previousLessonKey: string | null;
  nextLessonKey: string | null;
  courseTitle: string;
  ratioPercent: number;
  completed: boolean;
  currentLessonKey: string;
};

type ChromeT = ReturnType<typeof useTranslations<'dashboard.lessonViewer'>>;

const HUB_NAV_LINK =
  'rounded-md px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/55 hover:text-foreground whitespace-nowrap';

const HUB_NAV_BTN =
  'rounded-full border border-border/45 bg-background/85 px-2.5 py-0.5 text-[11px] font-medium text-foreground shadow-none backdrop-blur-sm transition-colors hover:bg-muted/45 whitespace-nowrap';

/** Learner dashboard: breadcrumb + completion only. */
function BreadcrumbRow({
  courseTitle,
  moduleTitleEn,
  lessonTitleEn,
  ratioPercent,
  t,
}: {
  courseTitle: string;
  moduleTitleEn: string;
  lessonTitleEn: string;
  ratioPercent: number;
  t: ChromeT;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-3 py-2">
      <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1.5 overflow-x-auto overflow-y-hidden text-[11px] font-medium text-muted-foreground [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="shrink-0 whitespace-nowrap">Flow Guide</span>
        <span className="shrink-0 text-muted-foreground/35">/</span>
        <span className="max-w-[28vw] shrink truncate sm:max-w-[180px]">{courseTitle}</span>
        <span className="shrink-0 text-muted-foreground/35">/</span>
        <span className="max-w-[28vw] shrink truncate font-medium text-foreground/90 sm:max-w-[160px]">
          {moduleTitleEn}
        </span>
        <span className="shrink-0 text-muted-foreground/35">/</span>
        <span className="min-w-0 shrink truncate font-medium text-primary">{lessonTitleEn}</span>
      </div>
      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        <span className="text-[10px] font-medium text-muted-foreground">{t('courseCompletion')}</span>
        <div className="w-16">
          <Progress
            value={ratioPercent}
            className="h-[3px] rounded-full bg-muted/80 [&>div]:rounded-full [&>div]:bg-foreground/70"
          />
        </div>
        <span className="w-6 text-right text-[10px] font-semibold tabular-nums text-foreground">
          {ratioPercent}%
        </span>
      </div>
    </div>
  );
}

/**
 * Single combined bar: brand + trail + Creator hub links + staff tools + completion.
 * `data-unified-lesson-chrome` hides the duplicate layout `<header>` via globals.css.
 */
function UnifiedPreviewChromeBar({
  courseTitle,
  moduleTitleEn,
  lessonTitleEn,
  ratioPercent,
  previewToolbar,
  t,
}: {
  courseTitle: string;
  moduleTitleEn: string;
  lessonTitleEn: string;
  ratioPercent: number;
  previewToolbar: ReactNode;
  t: ChromeT;
}) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-2 py-1 sm:gap-x-4 sm:py-1.5">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <Link
          href="/admin"
          className="hidden shrink-0 rounded-md text-[12px] font-semibold tracking-tight text-foreground opacity-90 transition-opacity hover:opacity-100 sm:inline"
        >
          Flow Guide
        </Link>
        <span className="hidden h-4 w-px shrink-0 bg-border/35 sm:block" aria-hidden />
        <div className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-0 flex-nowrap items-center gap-1 text-[10px] font-medium text-muted-foreground sm:text-[11px]">
            <span className="max-w-[42vw] shrink truncate sm:max-w-[220px]">{courseTitle}</span>
            <span className="shrink-0 text-muted-foreground/35">/</span>
            <span className="max-w-[30vw] shrink truncate text-foreground/88 sm:max-w-[160px]">
              {moduleTitleEn}
            </span>
            <span className="shrink-0 text-muted-foreground/35">/</span>
            <span className="min-w-0 shrink truncate font-medium text-primary">{lessonTitleEn}</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-2 gap-y-2 sm:flex-nowrap md:gap-x-2.5">
        <nav
          className="flex max-w-full items-center gap-0.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Creator hub"
        >
          <Link href="/admin" className={HUB_NAV_LINK}>
            Overview
          </Link>
          <Link href="/admin/courses" className={HUB_NAV_LINK}>
            Courses
          </Link>
          <Link href="/admin/media" className={HUB_NAV_LINK}>
            <span className="sm:hidden">Media</span>
            <span className="hidden sm:inline">Media library</span>
          </Link>
          <Link href="/dashboard/courses" className={`${HUB_NAV_BTN} ml-0.5 sm:ml-1`}>
            Learner app
          </Link>
        </nav>

        <span className="hidden h-4 w-px shrink-0 bg-border/35 md:block" aria-hidden />

        <div className="flex flex-wrap items-center gap-2">{previewToolbar}</div>

        <span className="hidden h-4 w-px shrink-0 bg-border/35 sm:block" aria-hidden />

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden text-[10px] font-medium text-muted-foreground lg:inline">
            {t('courseCompletion')}
          </span>
          <div className="w-12 sm:w-[4.25rem]">
            <Progress
              value={ratioPercent}
              className="h-[3px] rounded-full bg-muted/80 [&>div]:rounded-full [&>div]:bg-foreground/65"
            />
          </div>
          <span className="w-7 text-right text-[10px] font-semibold tabular-nums text-foreground sm:text-[11px]">
            {ratioPercent}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function LessonViewerShell({
  heroContent,
  journey,
  companion,
  article,
  previewBanner,
  previewToolbar,
  stickyHeaderTopClassName = 'top-14',
  stickyHeaderZClassName = 'z-[59]',
  courseSlug,
  courseOverviewHref,
  lessonLessonBasePath,
  previousLessonKey,
  nextLessonKey,
  courseTitle,
  ratioPercent,
  completed,
  currentLessonKey,
}: Props) {
  const t = useTranslations('dashboard.lessonViewer');
  const scrollPct = useLessonScrollProgress();
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [companionOpen, setCompanionOpen] = useState(false);

  const closePanels = useCallback(() => {
    setJourneyOpen(false);
    setCompanionOpen(false);
  }, []);

  const isPreview = Boolean(previewBanner || previewToolbar);
  const useUnifiedChrome = Boolean(previewToolbar);

  const previewBannerRef = useRef<HTMLDivElement | null>(null);
  const chromeBarRef = useRef<HTMLDivElement | null>(null);
  const learnerChromeRef = useRef<HTMLDivElement | null>(null);
  const [previewBannerH, setPreviewBannerH] = useState(0);
  const [chromeBarH, setChromeBarH] = useState(0);
  /** Viewport offset (px) from top to bottom of fixed/sticky lesson chrome — sidebars stick below this. */
  const [sidebarStickyTopPx, setSidebarStickyTopPx] = useState(0);

  useLayoutEffect(() => {
    if (!isPreview) {
      setPreviewBannerH(0);
      setChromeBarH(0);
      return;
    }

    const bannerEl = previewBannerRef.current;
    const chromeEl = chromeBarRef.current;

    const measureBanner = () => {
      if (!bannerEl) {
        setPreviewBannerH(0);
        return;
      }
      const h = bannerEl.getBoundingClientRect().height;
      setPreviewBannerH(h > 0 ? Math.ceil(h) : 0);
    };
    const measureChrome = () => {
      if (!chromeEl) return;
      const h = chromeEl.getBoundingClientRect().height;
      setChromeBarH(h > 0 ? Math.ceil(h) : 0);
    };

    measureBanner();
    measureChrome();

    const roBanner = bannerEl ? new ResizeObserver(measureBanner) : null;
    const roChrome = chromeEl ? new ResizeObserver(measureChrome) : null;
    if (bannerEl && roBanner) roBanner.observe(bannerEl);
    if (chromeEl && roChrome) roChrome.observe(chromeEl);

    const id = requestAnimationFrame(() => {
      measureBanner();
      measureChrome();
    });
    return () => {
      cancelAnimationFrame(id);
      roBanner?.disconnect();
      roChrome?.disconnect();
    };
  }, [isPreview, previewBanner, useUnifiedChrome]);

  useLayoutEffect(() => {
    const measureSidebarStickyTop = () => {
      const target = isPreview ? chromeBarRef.current : learnerChromeRef.current;
      if (!target) return;
      const bottom = Math.ceil(target.getBoundingClientRect().bottom);
      if (bottom > 0) setSidebarStickyTopPx(bottom);
    };

    measureSidebarStickyTop();
    const raf = requestAnimationFrame(measureSidebarStickyTop);

    const ro = new ResizeObserver(measureSidebarStickyTop);
    const observed = isPreview ? chromeBarRef.current : learnerChromeRef.current;
    if (observed) ro.observe(observed);

    window.addEventListener('resize', measureSidebarStickyTop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', measureSidebarStickyTop);
    };
  }, [isPreview, previewBanner, useUnifiedChrome, chromeBarH, previewBannerH]);

  useLayoutEffect(() => {
    const root = document.querySelector('[data-admin-root]') as HTMLElement | null;
    if (!root) return;
    if (!previewBanner) {
      root.style.setProperty('--admin-preview-ribbon-h', '0px');
      return;
    }
    root.style.setProperty('--admin-preview-ribbon-h', `${previewBannerH}px`);
    return () => {
      root.style.setProperty('--admin-preview-ribbon-h', '0px');
    };
  }, [previewBanner, previewBannerH]);

  /** Unified bar replaces layout hub — drive main padding from measured height. */
  useLayoutEffect(() => {
    const root = document.querySelector('[data-admin-root]') as HTMLElement | null;
    if (!root || !isPreview || !useUnifiedChrome) return;
    if (chromeBarH > 0) {
      root.style.setProperty('--admin-lesson-sticky-top', `${chromeBarH}px`);
    } else {
      root.style.removeProperty('--admin-lesson-sticky-top');
    }
    return () => {
      root.style.removeProperty('--admin-lesson-sticky-top');
    };
  }, [isPreview, useUnifiedChrome, chromeBarH]);

  const spacerH = previewBannerH + chromeBarH;

  const shellChromeVars = {
    ...(sidebarStickyTopPx > 0
      ? ({ '--lesson-sidebar-sticky-top': `${sidebarStickyTopPx}px` } as const)
      : {}),
  } as CSSProperties;

  return (
    <div className="relative min-h-full overflow-x-clip pb-28 lg:pb-24" style={shellChromeVars}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(ellipse_65%_40%_at_50%_0%,hsl(var(--primary)/0.11),transparent_62%)]"
        aria-hidden
      />

      {isPreview ? (
        <>
          {previewBanner ? (
            <div
              ref={previewBannerRef}
              className="fixed inset-x-0 top-0 z-[82] border-b border-border bg-muted"
            >
              <div className="w-full px-3 py-1 sm:px-5 lg:px-8">
                {previewBanner}
              </div>
            </div>
          ) : null}

          {useUnifiedChrome && previewToolbar ? (
            <div
              ref={chromeBarRef}
              data-unified-lesson-chrome
              className="fixed inset-x-0 z-[81] border-b border-border bg-background"
              style={{ top: 'var(--admin-preview-ribbon-h, 0px)' }}
            >
              <div className="w-full px-3 sm:px-5 lg:px-8">
                <UnifiedPreviewChromeBar
                  courseTitle={courseTitle}
                  moduleTitleEn={heroContent.moduleTitleEn}
                  lessonTitleEn={heroContent.titleEn}
                  ratioPercent={ratioPercent}
                  previewToolbar={previewToolbar}
                  t={t}
                />
              </div>
            </div>
          ) : (
            <div
              ref={chromeBarRef}
              className="fixed inset-x-0 z-[57] border-b border-border bg-background"
              style={{
                top:
                  'calc(var(--admin-preview-ribbon-h, 0px) + var(--admin-lesson-sticky-top, 6rem))',
              }}
            >
              <div className="w-full px-3 sm:px-5 lg:px-8">
                <BreadcrumbRow
                  courseTitle={courseTitle}
                  moduleTitleEn={heroContent.moduleTitleEn}
                  lessonTitleEn={heroContent.titleEn}
                  ratioPercent={ratioPercent}
                  t={t}
                />
              </div>
            </div>
          )}

          <div
            className="w-full shrink-0"
            style={{ height: spacerH > 0 ? spacerH : '4rem' }}
            aria-hidden
          />
        </>
      ) : (
        <div
          ref={learnerChromeRef}
          className={cn(
            'sticky w-full border-b border-border/35 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70',
            stickyHeaderZClassName,
            stickyHeaderTopClassName,
          )}
        >
          <div className="w-full px-4 sm:px-5">
            <BreadcrumbRow
              courseTitle={courseTitle}
              moduleTitleEn={heroContent.moduleTitleEn}
              lessonTitleEn={heroContent.titleEn}
              ratioPercent={ratioPercent}
              t={t}
            />
          </div>
        </div>
      )}

      {(journeyOpen || companionOpen) ? (
        <button
          type="button"
          className="fixed inset-0 z-[55] bg-stone-900/30 backdrop-blur-[1px] lg:hidden"
          aria-label="Close panel"
          onClick={closePanels}
        />
      ) : null}

      <div className="relative ml-[calc(50%-50vw)] w-screen max-w-none">
        <div
          className={cn(
            'z-20 flex w-[260px] shrink-0 flex-col transition-transform duration-300 ease-out xl:w-[280px]',
            'lg:fixed lg:bottom-0 lg:left-0 lg:top-[var(--lesson-sidebar-sticky-top,7rem)] lg:h-auto lg:min-h-0',
            'max-lg:fixed max-lg:left-0 max-lg:top-14 max-lg:h-[calc(100dvh-3.5rem)] max-lg:max-h-[calc(100dvh-3.5rem)] max-lg:w-[min(88vw,290px)]',
            journeyOpen ? 'max-lg:translate-x-0 max-lg:pointer-events-auto' : 'max-lg:-translate-x-[105%] max-lg:pointer-events-none',
            'scrollbar-lesson-sidebar max-lg:overflow-y-auto max-lg:rounded-r-3xl max-lg:border-y max-lg:border-r max-lg:border-sidebar-border max-lg:bg-sidebar max-lg:shadow-[14px_0_46px_-34px_hsl(var(--primary)/0.45)]',
            'max-lg:hidden',
          )}
        >
          <div
            className={cn(
              'flex flex-1 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar shadow-[14px_0_46px_-34px_hsl(var(--primary)/0.5)]',
              'max-lg:min-h-full lg:min-h-0 lg:max-h-full',
            )}
          >
            <div
              className={cn(
                'scrollbar-lesson-sidebar min-h-0 flex-1 overflow-x-hidden overflow-y-auto',
                SIDEBAR_SCROLL_PADDING,
              )}
            >
              {journey}
            </div>
          </div>
        </div>

        <div
          className={cn(
            'fixed bottom-0 left-0 top-14 z-[56] flex w-[min(88vw,290px)] flex-col overflow-hidden transition-transform duration-300 ease-out lg:hidden',
            'rounded-r-3xl border-y border-r border-sidebar-border bg-sidebar shadow-[14px_0_46px_-34px_hsl(var(--primary)/0.45)]',
            journeyOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-[105%] pointer-events-none',
          )}
        >
          <div className={cn('scrollbar-lesson-sidebar min-h-0 flex-1 overflow-y-auto', SIDEBAR_SCROLL_PADDING)}>
            {journey}
          </div>
        </div>

        <div className="min-h-0 min-w-0 w-full lg:pl-[260px] xl:pl-[280px] xl:pr-[300px]">
          <div
            className={cn(
              'px-6 sm:px-10 lg:px-12',
              isPreview ? 'py-6 sm:py-8 lg:py-9' : 'py-10',
            )}
          >
            <div className="mx-auto w-full max-w-[780px]">
              <LessonHero {...heroContent} readingPercent={scrollPct} />
              <LessonAtmosphere scrollPercent={scrollPct}>
                <div
                  id="lesson-article-body"
                  className={cn(
                    'lesson-article-body w-full',
                    isPreview ? 'pt-6 sm:pt-8' : 'pt-8 sm:pt-10',
                  )}
                >
                  {article}
                </div>
              </LessonAtmosphere>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'z-20 flex w-[260px] shrink-0 flex-col transition-transform duration-300 ease-out xl:w-[300px]',
            'xl:fixed xl:bottom-0 xl:right-0 xl:top-[var(--lesson-sidebar-sticky-top,7rem)] xl:h-auto xl:min-h-0',
            'max-xl:hidden',
          )}
        >
          <div
            className={cn(
              'flex flex-1 flex-col overflow-hidden border-l border-sidebar-border bg-sidebar shadow-[-14px_0_46px_-34px_hsl(var(--primary)/0.5)]',
              'max-xl:min-h-full xl:min-h-0 xl:max-h-full',
            )}
          >
            <div
              className={cn(
                'scrollbar-lesson-sidebar min-h-0 flex-1 overflow-x-hidden overflow-y-auto',
                SIDEBAR_SCROLL_PADDING,
              )}
            >
              {companion}
            </div>
          </div>
        </div>

        <div
          className={cn(
            'fixed bottom-0 right-0 top-14 z-[56] flex w-[min(88vw,290px)] flex-col overflow-hidden transition-transform duration-300 ease-out xl:hidden',
            'rounded-l-3xl border-y border-l border-sidebar-border bg-sidebar shadow-[-14px_0_46px_-34px_hsl(var(--primary)/0.45)]',
            companionOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-[105%] pointer-events-none',
          )}
        >
          <div className={cn('scrollbar-lesson-sidebar min-h-0 flex-1 overflow-y-auto', SIDEBAR_SCROLL_PADDING)}>
            {companion}
          </div>
        </div>
      </div>

      <LessonBottomNav
        courseSlug={courseSlug}
        courseOverviewHref={courseOverviewHref}
        lessonLessonBasePath={lessonLessonBasePath}
        previousLessonKey={previousLessonKey}
        nextLessonKey={nextLessonKey}
        completed={completed}
        currentLessonKey={currentLessonKey}
        showMobileTools
        onOpenJourney={() => {
          setCompanionOpen(false);
          setJourneyOpen(true);
        }}
        onOpenCompanion={() => {
          setJourneyOpen(false);
          setCompanionOpen(true);
        }}
      />
    </div>
  );
}
