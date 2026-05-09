'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, LayoutGrid, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { buildLessonUrl } from '@/components/courses/lesson-experience';
import { markLessonProgressAction } from '@/lib/courses/actions';
import { cn } from '@/lib/utils';

type Props = {
  courseSlug: string;
  courseOverviewHref: string;
  lessonLessonBasePath?: string;
  previousLessonKey: string | null;
  nextLessonKey: string | null;
  completed: boolean;
  currentLessonKey: string;
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
  completed,
  currentLessonKey,
  onOpenJourney,
  onOpenCompanion,
  showMobileTools,
  className,
}: Props) {
  const t = useTranslations('dashboard.lessonViewer');

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-[70] border-t border-border bg-card/90 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl',
        className
      )}
    >
      <div className="flex w-full items-center gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8 xl:px-10">

        {/* LEFT ZONE — previous + mobile outline toggle */}
        <div className="flex items-center gap-1 sm:gap-2">
          {showMobileTools && onOpenJourney ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full text-muted-foreground lg:hidden"
              onClick={onOpenJourney}
            >
              {t('openJourney')}
            </Button>
          ) : null}
          {previousLessonKey ? (
            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground" asChild>
              <Link href={buildLessonUrl(courseSlug, previousLessonKey, lessonLessonBasePath)}>
                <ArrowLeft className="size-4" />
                <span className="ml-1 hidden sm:inline">{t('floatingPrev')}</span>
              </Link>
            </Button>
          ) : (
            <span className="w-4" />
          )}
        </div>

        {/* CENTER ZONE — roadmap + mark complete */}
        <div className="flex flex-1 items-center justify-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-[hsl(var(--lesson-border)/0.55)] bg-[hsl(var(--lesson-canvas)/0.6)] px-3 text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href={courseOverviewHref}>
              <LayoutGrid className="size-4" />
              <span className="ml-1.5 hidden sm:inline">{t('floatingModule')}</span>
            </Link>
          </Button>

          <form action={markLessonProgressAction}>
            <input type="hidden" name="courseSlug" value={courseSlug} />
            <input type="hidden" name="lessonKey" value={currentLessonKey} />
            <input type="hidden" name="completed" value={completed ? 'false' : 'true'} />
            <Button
              type="submit"
              size="sm"
              variant={completed ? 'outline' : 'default'}
              className={cn(
                'rounded-full px-4 font-semibold transition-[filter,transform] duration-150 active:scale-[0.98]',
                completed
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/18 dark:text-emerald-300'
                  : 'border-0 bg-gradient-to-r from-primary to-[hsl(278_72%_52%)] shadow-[0_10px_24px_-14px_hsl(var(--primary)/0.75)] hover:brightness-105'
              )}
            >
              {completed ? (
                <CheckCircle2 className="mr-1.5 size-4" aria-hidden />
              ) : (
                <Sparkles className="mr-1.5 size-4" aria-hidden />
              )}
              <span className="hidden sm:inline">
                {completed ? t('completedLesson') : t('markComplete')}
              </span>
              <span className="sm:hidden">{completed ? '✓' : t('markComplete')}</span>
            </Button>
          </form>
        </div>

        {/* RIGHT ZONE — next lesson + mobile companion toggle */}
        <div className="flex items-center gap-1 sm:gap-2">
          {nextLessonKey ? (
            <Button
              size="sm"
              className="rounded-full border-0 bg-gradient-to-r from-primary to-[hsl(278_72%_52%)] px-4 font-semibold shadow-[0_12px_26px_-16px_hsl(var(--primary)/0.8)]"
              asChild
            >
              <Link href={buildLessonUrl(courseSlug, nextLessonKey, lessonLessonBasePath)}>
                <span className="hidden sm:inline">{t('floatingNext')}</span>
                <ArrowRight className="size-4 sm:ml-1" />
              </Link>
            </Button>
          ) : (
            <span className="w-4" />
          )}
          {showMobileTools && onOpenCompanion ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full text-muted-foreground lg:hidden"
              onClick={onOpenCompanion}
            >
              {t('openCompanion')}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
