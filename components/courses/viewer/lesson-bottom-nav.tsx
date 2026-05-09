'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, LayoutGrid } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { buildLessonUrl } from '@/components/courses/lesson-experience';
import { cn } from '@/lib/utils';

type Props = {
  courseSlug: string;
  courseOverviewHref: string;
  lessonLessonBasePath?: string;
  previousLessonKey: string | null;
  nextLessonKey: string | null;
  onOpenJourney?: () => void;
  onOpenCompanion?: () => void;
  showMobileTools?: boolean;
  className?: string;
};

export function LessonBottomNav({
  courseSlug,
  courseOverviewHref,
  lessonLessonBasePath,
  previousLessonKey,
  nextLessonKey,
  onOpenJourney,
  onOpenCompanion,
  showMobileTools,
  className,
}: Props) {
  const t = useTranslations('dashboard.lessonViewer');

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 border-t border-[hsl(var(--lesson-border)/0.45)] bg-[hsl(var(--lesson-canvas)/0.88)]/95 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_-24px_hsl(var(--primary)/0.25)] backdrop-blur-md supports-[padding:max(0px)]:px-4',
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-none items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        {showMobileTools && onOpenJourney && onOpenCompanion ? (
          <div className="flex gap-1 sm:hidden">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full border-[hsl(var(--lesson-border)/0.55)] text-xs"
              onClick={onOpenJourney}
            >
              {t('openJourney')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full border-[hsl(var(--lesson-border)/0.55)] text-xs"
              onClick={onOpenCompanion}
            >
              {t('openCompanion')}
            </Button>
          </div>
        ) : (
          <span className="sm:hidden" />
        )}

        <div className="flex min-w-0 flex-1 items-center justify-center gap-1 sm:justify-between sm:gap-3">
          {previousLessonKey ? (
            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground" asChild>
              <Link href={buildLessonUrl(courseSlug, previousLessonKey, lessonLessonBasePath)}>
                <ArrowLeft className="size-4 sm:mr-1" />
                <span className="hidden sm:inline">{t('floatingPrev')}</span>
              </Link>
            </Button>
          ) : (
            <span className="hidden w-20 sm:block" />
          )}

          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-[hsl(var(--lesson-border)/0.55)] px-3"
            asChild
          >
            <Link href={courseOverviewHref}>
              <LayoutGrid className="size-4 sm:mr-1.5" />
              <span className="hidden sm:inline">{t('floatingModule')}</span>
            </Link>
          </Button>

          {nextLessonKey ? (
            <Button
              size="sm"
              className="rounded-full border-0 bg-gradient-to-r from-primary to-[hsl(278_72%_52%)] px-4 font-semibold shadow-md"
              asChild
            >
              <Link href={buildLessonUrl(courseSlug, nextLessonKey, lessonLessonBasePath)}>
                <span className="hidden sm:inline">{t('floatingNext')}</span>
                <ArrowRight className="size-4 sm:ml-1" />
              </Link>
            </Button>
          ) : (
            <span className="hidden w-24 sm:block" />
          )}
        </div>
      </div>
    </div>
  );
}
