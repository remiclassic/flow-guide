'use client';

import { useTranslations } from 'next-intl';
import { Clock, Route } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
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
      className={cn(
        'relative isolate w-full overflow-hidden rounded-[2rem] border border-[hsl(var(--lesson-border)/0.45)] bg-[hsl(var(--lesson-wash)/0.65)] px-6 py-10 shadow-[0_24px_80px_-48px_hsl(var(--primary)/0.35)] sm:px-10 sm:py-12',
        className
      )}
    >
      <div
        className="pointer-events-none absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.14)_0%,transparent_68%)] blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-[320px] w-[380px] rounded-full bg-[radial-gradient(circle,hsl(265_65%_72%/0.2)_0%,transparent_65%)] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,hsl(var(--lesson-wash)/0.95)_0%,transparent_55%,hsl(var(--lesson-glow)/0.5)_100%)]"
        aria-hidden
      />

      <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_min(280px,38%)] lg:items-center lg:gap-12">
        <div className="min-w-0 space-y-6">
          <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-primary/90">
            Module {moduleNum >= 0 ? moduleNum + 1 : '—'} · {moduleTitleEn}
          </p>

          <div className="space-y-4">
            <h1 className="text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.038em] text-[hsl(var(--lesson-ink))]">
              {titleEn}
            </h1>
            {titleEs?.trim() ? (
              <p className="text-lg font-medium leading-snug text-[hsl(var(--lesson-muted))]">
                {titleEs.trim()}
              </p>
            ) : null}
            {subtitleEn?.trim() ? (
              <p className="max-w-4xl text-lg leading-relaxed text-[hsl(var(--lesson-muted))] lg:max-w-none">
                {subtitleEn.trim()}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[hsl(var(--lesson-muted))]">
            {est != null ? (
              <span className="inline-flex items-center gap-2">
                <Clock className="size-4 shrink-0 text-primary/80" aria-hidden />
                <span>
                  About {est} min{est === 1 ? '' : 's'}
                </span>
              </span>
            ) : null}
            <span className="inline-flex items-center gap-2">
              <Route className="size-4 shrink-0 text-primary/80" aria-hidden />
              <span>
                Lesson {lessonCurrent} of {lessonTotal}
              </span>
            </span>
            {completed ? (
              <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                Complete
              </span>
            ) : null}
          </div>

          <div className="max-w-xl space-y-2 pt-2">
            <div className="flex justify-between text-xs font-medium text-[hsl(var(--lesson-muted))]">
              <span>Your progress in this lesson</span>
              <span className="tabular-nums text-foreground">
                {Math.round(readingPercent)}%
              </span>
            </div>
            <Progress
              value={readingPercent}
              className="h-2 rounded-full bg-[hsl(var(--lesson-border)/0.5)] [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-[hsl(278_70%_62%)]"
            />
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-[320px] justify-center lg:mx-0 lg:max-w-none">
          {heroImageUrl ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-[0_20px_50px_-28px_hsl(var(--primary)/0.45)] ring-1 ring-[hsl(var(--lesson-border)/0.45)]">
              {/* eslint-disable-next-line @next/next/no-img-element -- dynamic CMS URLs */}
              <img
                src={heroImageUrl}
                alt={heroImageAlt ?? ''}
                className="size-full object-cover"
              />
            </div>
          ) : (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-[linear-gradient(165deg,hsl(var(--primary)/0.12)_0%,hsl(265_55%_94%/0.9)_45%,hsl(35_80%_92%/0.85)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_22px_60px_-36px_hsl(var(--primary)/0.5)] ring-1 ring-[hsl(var(--lesson-border)/0.35)]">
              <div
                className="absolute inset-0 opacity-[0.55]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cpath fill='%237c3aed22' d='M60 10 L110 95 L10 95 Z'/%3E%3C/svg%3E")`,
                  backgroundSize: '220px 220px',
                  backgroundPosition: '80% 20%',
                  backgroundRepeat: 'no-repeat',
                }}
                aria-hidden
              />
              <div className="absolute inset-x-6 bottom-6 top-auto h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
              <p className="absolute bottom-5 left-6 right-6 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-primary/55">
                {t('heroVisualCaption')}
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
