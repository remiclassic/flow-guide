'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Play,
} from 'lucide-react';
import { FlowLogoMark } from '@/components/brand/flow-logo';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { RoadmapModule } from '@/components/courses/lesson-roadmap-aside';

type Props = {
  courseSlug: string;
  courseTitle: string;
  unlocked: boolean;
  modules: RoadmapModule[];
  currentLessonKey: string;
  lessonLessonBasePath?: string;
  ratioPercent: number;
  ratioCompleted: number;
  ratioTotal: number;
  continueHref: string;
  continueTitle: string | null;
  backToCourseHref: string;
  className?: string;
};

export function LessonJourneyNav({
  courseSlug,
  courseTitle,
  unlocked,
  modules,
  currentLessonKey,
  lessonLessonBasePath,
  ratioPercent,
  ratioCompleted,
  ratioTotal,
  continueHref,
  continueTitle,
  backToCourseHref,
  className,
}: Props) {
  const t = useTranslations('dashboard.lessonViewer');

  const initialExpanded = useMemo(() => {
    const mod = modules.find((m) =>
      m.lessons.some((l) => l.lessonKey === currentLessonKey)
    );
    return mod ? new Set<number>([mod.id]) : new Set<number>();
  }, [modules, currentLessonKey]);

  const [expanded, setExpanded] = useState<Set<number>>(initialExpanded);

  const toggleModule = useCallback((id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <nav
      className={cn(
        'flex max-h-[calc(100dvh-8rem)] flex-col gap-5 overflow-hidden rounded-3xl border border-[hsl(var(--lesson-border)/0.45)] bg-[hsl(var(--lesson-wash)/0.55)] p-5 shadow-[0_20px_60px_-40px_hsl(var(--primary)/0.35)] backdrop-blur-sm',
        className
      )}
      aria-label={t('journeyTitle')}
    >
      <div className="flex items-start gap-3">
        <FlowLogoMark size={40} className="size-10 shrink-0" />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Flow Guide
          </p>
          <p className="truncate text-sm font-semibold leading-snug text-foreground">
            {courseTitle}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[hsl(var(--lesson-border)/0.35)] bg-[hsl(var(--lesson-canvas)/0.65)] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {t('courseProgress')}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="relative grid size-14 shrink-0 place-items-center">
            <svg className="col-start-1 row-start-1 size-14 -rotate-90" viewBox="0 0 36 36" aria-hidden>
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-[hsl(var(--lesson-border)/0.65)]"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-primary transition-[stroke-dashoffset] duration-500 ease-out"
                strokeWidth="3"
                strokeDasharray={97.4}
                strokeDashoffset={97.4 - (97.4 * ratioPercent) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="col-start-1 row-start-1 text-[11px] font-bold tabular-nums text-foreground">
              {ratioPercent}%
            </span>
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {ratioCompleted}/{ratioTotal} lessons
              </span>
            </div>
            <Progress
              value={ratioPercent}
              className="h-1.5 rounded-full bg-[hsl(var(--lesson-border)/0.45)]"
            />
          </div>
        </div>
      </div>

      {continueTitle ? (
        <Link
          href={continueHref}
          className="group rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] to-transparent p-4 transition-colors hover:border-primary/35 hover:from-primary/[0.12]"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            {t('continueJourney')}
          </p>
          <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-foreground group-hover:text-primary">
            {continueTitle}
          </p>
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
            <BookOpen className="size-3.5" />
            {t('floatingNext')}
          </p>
        </Link>
      ) : null}

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {t('lessonOutline')}
        </p>
        <ul className="space-y-1">
          {modules.map((mod) => {
            const isOpen = expanded.has(mod.id);
            return (
              <li key={mod.id} className="rounded-2xl border border-transparent">
                <button
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm font-semibold text-foreground transition-colors hover:bg-[hsl(var(--lesson-glow)/0.45)]"
                  aria-expanded={isOpen}
                >
                  {isOpen ? (
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="min-w-0 flex-1 truncate">{mod.titleEn}</span>
                </button>
                {isOpen ? (
                  <ul className="space-y-0.5 pb-2 pl-2">
                    {mod.lessons.map((lesson) => {
                      const active = lesson.lessonKey === currentLessonKey;
                      const base = lessonLessonBasePath?.trim();
                      const href = base
                        ? `${base.replace(/\/$/, '')}/${lesson.lessonKey}`
                        : unlocked
                          ? `/dashboard/courses/${courseSlug}/lessons/${lesson.lessonKey}`
                          : '/pricing?reason=subscription';

                      return (
                        <li key={lesson.lessonKey}>
                          <Link
                            href={href}
                            className={cn(
                              'flex items-center gap-2 rounded-xl px-2.5 py-2 text-[13px] transition-colors',
                              active
                                ? 'bg-primary/[0.12] font-semibold text-primary ring-1 ring-primary/20'
                                : 'text-muted-foreground hover:bg-[hsl(var(--lesson-glow)/0.5)] hover:text-foreground'
                            )}
                          >
                            {lesson.done ? (
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                <Check className="size-3.5" strokeWidth={2.5} />
                              </span>
                            ) : active ? (
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                                <Play className="size-3.5 fill-current" />
                              </span>
                            ) : (
                              <Circle className="size-4 shrink-0 text-muted-foreground/40" />
                            )}
                            <span className="min-w-0 flex-1 leading-snug">{lesson.titleEn}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      <Link
        href={backToCourseHref}
        className="mt-auto inline-flex items-center justify-center rounded-full border border-[hsl(var(--lesson-border)/0.55)] bg-[hsl(var(--lesson-canvas)/0.5)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[hsl(var(--lesson-glow)/0.55)]"
      >
        {t('backToCourse')}
      </Link>
    </nav>
  );
}
