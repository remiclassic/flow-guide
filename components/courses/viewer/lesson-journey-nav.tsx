'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
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
      className={cn('flex min-h-full flex-col gap-4', className)}
      aria-label={t('journeyTitle')}
    >
      <div className="flex items-start gap-3 px-0.5">
        <FlowLogoMark size={40} className="size-10 shrink-0" />
        <div className="min-w-0 flex flex-col leading-tight">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Flow Guide
          </p>
          <p className="truncate text-base font-semibold tracking-[-0.025em] text-sidebar-foreground">
            {courseTitle}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {t('lessonOutline')}
        </p>
        <ul className="space-y-0.5">
          {modules.map((mod) => {
            const isOpen = expanded.has(mod.id);
            const doneCount = mod.lessons.filter((lesson) => lesson.done).length;
            const modulePercent =
              mod.lessons.length > 0
                ? Math.round((doneCount / mod.lessons.length) * 100)
                : 0;
            return (
              <li key={mod.id} className="rounded-xl border border-transparent">
                <button
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  className="w-full rounded-xl px-3 py-2 text-left transition-all duration-150 hover:bg-muted/80"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-2 text-[13px] font-semibold text-sidebar-foreground">
                    {isOpen ? (
                      <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="min-w-0 flex-1 truncate">{mod.titleEn}</span>
                    <span className="shrink-0 text-[10px] font-semibold tabular-nums text-muted-foreground">
                      {doneCount}/{mod.lessons.length}
                    </span>
                  </span>
                  <Progress
                    value={modulePercent}
                    className="mt-2 h-1 rounded-full bg-muted [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-[hsl(34_88%_62%)]"
                  />
                </button>
                {isOpen ? (
                  <ul className="space-y-0.5 pb-2 pt-0.5">
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
                              'group relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold transition-all duration-150',
                              active
                                ? 'bg-[linear-gradient(135deg,hsl(var(--primary)/0.12),hsl(var(--sidebar-accent)))] text-sidebar-accent-foreground shadow-sm ring-1 ring-primary/10'
                                : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                            )}
                          >
                            {active ? (
                              <span
                                className="absolute right-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-l-full bg-primary"
                                aria-hidden
                              />
                            ) : null}
                            <span
                              className={cn(
                                'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                                active
                                  ? 'bg-white/80 text-primary shadow-sm'
                                  : lesson.done
                                    ? 'bg-muted/55 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-muted/55 text-foreground/70 group-hover:text-foreground'
                              )}
                            >
                              {lesson.done ? (
                                <Check className="size-[15px]" strokeWidth={2.5} />
                              ) : active ? (
                                <Play className="size-[15px] fill-current" />
                              ) : (
                                <Circle className="size-[15px] text-muted-foreground/45 transition-colors group-hover:text-primary/55" />
                              )}
                            </span>
                            <span className="min-w-0 flex-1 truncate leading-snug">
                              {lesson.titleEn}
                            </span>
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
        className="mt-auto inline-flex w-full items-center justify-center rounded-xl border border-sidebar-border bg-muted/40 px-3 py-2 text-[13px] font-semibold text-muted-foreground transition-all duration-150 hover:bg-muted/80 hover:text-foreground"
      >
        {t('backToCourse')}
      </Link>
    </nav>
  );
}
