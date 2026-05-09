'use client';

import { type ReactNode, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { useLessonScrollProgress } from '@/hooks/use-lesson-scroll-progress';
import { LessonReadingRail } from '@/components/courses/viewer/lesson-reading-rail';
import { LessonAtmosphere } from '@/components/courses/viewer/lesson-atmosphere';
import { LessonBottomNav } from '@/components/courses/viewer/lesson-bottom-nav';
import { LessonHero, type LessonHeroContentProps } from '@/components/courses/viewer/lesson-hero';

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
}: Props) {
  const scrollPct = useLessonScrollProgress();
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [companionOpen, setCompanionOpen] = useState(false);

  const closePanels = useCallback(() => {
    setJourneyOpen(false);
    setCompanionOpen(false);
  }, []);

  return (
    <div className="relative min-h-full pb-28 lg:pb-24">
      <LessonReadingRail percent={scrollPct} />

      {previewBanner ? (
        <div className="mb-6 w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">{previewBanner}</div>
      ) : null}

      {(journeyOpen || companionOpen) ? (
        <button
          type="button"
          className="fixed inset-0 z-[55] bg-stone-900/35 backdrop-blur-[2px] lg:hidden"
          aria-label="Close panel"
          onClick={closePanels}
        />
      ) : null}

      <div className="grid w-full max-w-none grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-[clamp(220px,22vw,320px)_minmax(0,1fr)_clamp(240px,22vw,340px)] lg:gap-8 lg:px-8 xl:gap-10 xl:px-10 2xl:px-12">
        <div
          className={cn(
            'z-[60] min-h-0 transition-transform duration-300 ease-out lg:sticky lg:top-24 lg:h-fit lg:translate-x-0 lg:self-start',
            'max-lg:fixed max-lg:left-0 max-lg:top-[calc(3.5rem+max(0px,env(safe-area-inset-top)))] max-lg:max-h-[calc(100dvh-5rem)] max-lg:w-[min(92vw,300px)]',
            journeyOpen ? 'max-lg:translate-x-0 max-lg:pointer-events-auto' : 'max-lg:-translate-x-[104%] max-lg:pointer-events-none',
            'max-lg:overflow-y-auto max-lg:rounded-r-3xl max-lg:border-y max-lg:border-r max-lg:border-[hsl(var(--lesson-border)/0.4)] max-lg:bg-[hsl(var(--lesson-canvas)/0.98)] max-lg:shadow-2xl'
          )}
        >
          {journey}
        </div>

        <div className="order-first min-w-0 w-full max-w-none space-y-8 lg:order-none lg:space-y-10">
          <LessonHero {...heroContent} readingPercent={scrollPct} />
          <LessonAtmosphere scrollPercent={scrollPct}>
            <div
              id="lesson-article-body"
              className="lesson-article-body w-full max-w-none space-y-10 pb-8"
            >
              {article}
            </div>
          </LessonAtmosphere>
        </div>

        <div
          className={cn(
            'z-[60] min-h-0 transition-transform duration-300 ease-out lg:sticky lg:top-24 lg:h-fit lg:translate-x-0 lg:self-start',
            'max-lg:fixed max-lg:right-0 max-lg:top-[calc(3.5rem+max(0px,env(safe-area-inset-top)))] max-lg:max-h-[calc(100dvh-5rem)] max-lg:w-[min(92vw,300px)]',
            companionOpen
              ? 'max-lg:translate-x-0 max-lg:pointer-events-auto'
              : 'max-lg:translate-x-[104%] max-lg:pointer-events-none',
            'max-lg:overflow-y-auto max-lg:rounded-l-3xl max-lg:border-y max-lg:border-l max-lg:border-[hsl(var(--lesson-border)/0.4)] max-lg:bg-[hsl(var(--lesson-canvas)/0.98)] max-lg:shadow-2xl'
          )}
        >
          {companion}
        </div>
      </div>

      <LessonBottomNav
        courseSlug={courseSlug}
        courseOverviewHref={courseOverviewHref}
        lessonLessonBasePath={lessonLessonBasePath}
        previousLessonKey={previousLessonKey}
        nextLessonKey={nextLessonKey}
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
