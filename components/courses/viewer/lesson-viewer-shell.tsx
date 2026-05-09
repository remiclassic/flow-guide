'use client';

import { type ReactNode, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useLessonScrollProgress } from '@/hooks/use-lesson-scroll-progress';
import { LessonAtmosphere } from '@/components/courses/viewer/lesson-atmosphere';
import { LessonBottomNav } from '@/components/courses/viewer/lesson-bottom-nav';
import { LessonHero, type LessonHeroContentProps } from '@/components/courses/viewer/lesson-hero';
import { Progress } from '@/components/ui/progress';

type Props = {
  heroContent: LessonHeroContentProps;
  journey: ReactNode;
  companion: ReactNode;
  article: ReactNode;
  previewBanner?: ReactNode;
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

export function LessonViewerShell({
  heroContent,
  journey,
  companion,
  article,
  previewBanner,
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

  return (
    <div className="relative min-h-full pb-28 lg:pb-24">
      {/* Ambient glow backdrop */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(ellipse_65%_40%_at_50%_0%,hsl(var(--primary)/0.11),transparent_62%)]"
        aria-hidden
      />

      {/* Preview banner — slim strip, doesn't consume lesson space */}
      {previewBanner ? (
        <div className="sticky top-14 z-[59] w-full border-b border-amber-300/40 bg-amber-50/95 px-5 py-2 backdrop-blur-md dark:border-amber-700/30 dark:bg-amber-950/80">
          {previewBanner}
        </div>
      ) : null}

      {/* ─── Top status strip — full-width, no card ─────── */}
      <div className="flex items-center gap-3 border-b border-border bg-card/80 px-5 py-2.5 backdrop-blur-sm">
        {/* Breadcrumb */}
        <div className="min-w-0 flex-1 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <span className="shrink-0">Flow Guide</span>
          <span className="text-primary/40">/</span>
          <span className="truncate">{courseTitle}</span>
          <span className="text-primary/40">/</span>
          <span className="truncate font-semibold text-foreground">{heroContent.moduleTitleEn}</span>
          <span className="text-primary/40">/</span>
          <span className="truncate text-primary font-semibold">{heroContent.titleEn}</span>
        </div>
        {/* Compact completion */}
        <div className="hidden shrink-0 items-center gap-2.5 sm:flex">
          <span className="text-[11px] font-medium text-muted-foreground">{t('courseCompletion')}</span>
          <div className="w-20">
            <Progress
              value={ratioPercent}
              className="h-1 rounded-full bg-[hsl(var(--lesson-border)/0.5)] [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-[hsl(34_88%_62%)]"
            />
          </div>
          <span className="w-7 text-right text-[11px] font-semibold tabular-nums text-foreground">{ratioPercent}%</span>
        </div>
      </div>

      {/* Mobile backdrop for open panels */}
      {(journeyOpen || companionOpen) ? (
        <button
          type="button"
          className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-[2px] lg:hidden"
          aria-label="Close panel"
          onClick={closePanels}
        />
      ) : null}

      {/* ─── Three-column edge-to-edge layout ─────────────── */}
      <div className="flex w-full items-start">

        {/* LEFT — Journey nav, flush to left edge */}
        <div
          className={cn(
            'z-[60] w-[260px] shrink-0 transition-transform duration-300 ease-out xl:w-[280px]',
            'lg:sticky lg:top-14 lg:self-start lg:translate-x-0',
            'max-lg:fixed max-lg:left-0 max-lg:top-14 max-lg:max-h-[calc(100dvh-3.5rem)] max-lg:w-[min(88vw,290px)]',
            journeyOpen ? 'max-lg:translate-x-0 max-lg:pointer-events-auto' : 'max-lg:-translate-x-[105%] max-lg:pointer-events-none',
            'max-lg:overflow-y-auto max-lg:rounded-r-3xl max-lg:border-y max-lg:border-r max-lg:border-border max-lg:bg-sidebar max-lg:shadow-2xl',
            'max-lg:hidden'
          )}
        >
          <div className="min-h-[calc(100dvh-3.5rem)] border-r border-border bg-sidebar p-4">
            {journey}
          </div>
        </div>

        {/* Mobile left drawer — separate from desktop */}
        <div
          className={cn(
            'fixed left-0 top-14 z-[60] max-h-[calc(100dvh-3.5rem)] w-[min(88vw,290px)] overflow-y-auto transition-transform duration-300 ease-out lg:hidden',
            'rounded-r-3xl border-y border-r border-border bg-sidebar shadow-2xl',
            journeyOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-[105%] pointer-events-none'
          )}
        >
          <div className="p-4">{journey}</div>
        </div>

        {/* CENTER — Lesson stage, expands to fill */}
        <div className="min-w-0 flex-1">
          <div className="px-5 py-8 sm:px-8">
            <LessonHero {...heroContent} readingPercent={scrollPct} />
            <div className="my-8 h-px bg-gradient-to-r from-transparent via-[hsl(var(--lesson-border)/0.5)] to-transparent" />
            <LessonAtmosphere scrollPercent={scrollPct}>
              <div
                id="lesson-article-body"
                className="lesson-article-body w-full space-y-8"
              >
                {article}
              </div>
            </LessonAtmosphere>
          </div>
        </div>

        {/* RIGHT — Companion panel, flush to right edge */}
        <div
          className={cn(
            'z-[60] w-[260px] shrink-0 transition-transform duration-300 ease-out xl:w-[300px]',
            'xl:sticky xl:top-14 xl:self-start xl:translate-x-0',
            'max-xl:hidden'
          )}
        >
          <div className="min-h-[calc(100dvh-3.5rem)] border-l border-border bg-sidebar p-4">
            {companion}
          </div>
        </div>

        {/* Mobile right drawer */}
        <div
          className={cn(
            'fixed right-0 top-14 z-[60] max-h-[calc(100dvh-3.5rem)] w-[min(88vw,290px)] overflow-y-auto transition-transform duration-300 ease-out xl:hidden',
            'rounded-l-3xl border-y border-l border-border bg-sidebar shadow-2xl',
            companionOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-[105%] pointer-events-none'
          )}
        >
          <div className="p-4">{companion}</div>
        </div>
      </div>

      {/* Bottom dock */}
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
