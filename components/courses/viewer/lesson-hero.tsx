'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle2, Clock, Route } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  moduleTitleEn: string;
  moduleNum: number;
  titleEn: string;
  titleEs: string | null;
  subtitleEn: string | null;
  estimatedMinutes: number | null;
  lessonCurrent: number;
  lessonTotal: number;
  /** In-lesson reading progress 0–100 (optional visual). */
  readingPercent?: number;
  heroImageUrl: string | null;
  heroImageAlt?: string;
  completed: boolean;
  className?: string;
};

/** Props supplied by the lesson page; `readingPercent` is injected in `LessonViewerShell`. */
export type LessonHeroContentProps = Omit<Props, 'readingPercent'>;

export function LessonHero({
  moduleTitleEn,
  moduleNum,
  titleEn,
  titleEs,
  subtitleEn,
  estimatedMinutes,
  lessonCurrent,
  lessonTotal,
  readingPercent = 0,
  heroImageUrl,
  heroImageAlt,
  completed,
  className,
}: Props) {
  const t = useTranslations('dashboard.lessonViewer');
  const est =
    estimatedMinutes != null && estimatedMinutes > 0 ? estimatedMinutes : null;

  return (
    <header
      className={cn('relative w-full', className)}
    >
      {/* Eyebrow */}
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/80">
        {t('moduleChapter', {
          num: moduleNum >= 0 ? moduleNum + 1 : '—',
          title: moduleTitleEn,
        })}
      </p>

      {/* Two-col: text left, optional image right */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(260px,34%)] lg:items-center lg:gap-10">
        <div className="min-w-0 space-y-5">
          <h1 className="text-[clamp(1.9rem,4.5vw,3rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-[hsl(var(--lesson-ink))]">
            {titleEn}
          </h1>

          {titleEs?.trim() ? (
            <p className="text-base font-medium leading-snug text-[hsl(var(--lesson-muted))]">
              {titleEs.trim()}
            </p>
          ) : null}

          {subtitleEn?.trim() ? (
            <p className="text-[1.05rem] leading-relaxed text-[hsl(var(--lesson-muted))]">
              {subtitleEn.trim()}
            </p>
          ) : null}

          {/* Metadata row — clean horizontal, no card */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[hsl(var(--lesson-muted))]">
            {est != null ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5 shrink-0 text-primary/70" aria-hidden />
                {t('estimatedMinutes', { minutes: est })}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Route className="size-3.5 shrink-0 text-primary/70" aria-hidden />
              {t('lessonPositionMeta', { current: lessonCurrent, total: lessonTotal })}
            </span>
            {completed ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
                {t('completedLesson')}
              </span>
            ) : null}
          </div>

        </div>

        {/* Hero visual */}
        <div className="relative mx-auto w-full max-w-[280px] lg:mx-0 lg:max-w-none">
          {heroImageUrl ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-[0_20px_50px_-28px_hsl(var(--primary)/0.5)] ring-1 ring-[hsl(var(--lesson-border)/0.35)]">
              {/* eslint-disable-next-line @next/next/no-img-element -- dynamic CMS URLs */}
              <img
                src={heroImageUrl}
                alt={heroImageAlt ?? ''}
                className="size-full object-cover"
              />
            </div>
          ) : (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[linear-gradient(155deg,hsl(var(--primary)/0.12)_0%,hsl(265_55%_94%/0.9)_50%,hsl(35_70%_92%/0.85)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_18px_48px_-30px_hsl(var(--primary)/0.4)] ring-1 ring-[hsl(var(--lesson-border)/0.3)]">
              <p className="absolute bottom-4 left-4 right-4 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/50">
                {t('heroVisualCaption')}
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
