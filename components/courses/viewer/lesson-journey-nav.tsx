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
      className={cn('flex flex-col gap-4', className)}
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

      <div className="space-y-2">
        <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {t('lessonOutline')}
        </p>
        <ul className="space-y-1">
          {modules.map((mod) => {
            const isOpen = expanded.has(mod.id);
            const doneCount = mod.lessons.filter((lesson) => lesson.done).length;
            const modulePercent =
              mod.lessons.length > 0
                ? Math.round((doneCount / mod.lessons.length) * 100)
                : 0;
            return (
              <li key={mod.id} className="rounded-2xl border border-transparent">
                <button
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  className="w-full rounded-[1.1rem] px-2 py-2 text-left transition-colors hover:bg-[hsl(var(--lesson-glow)/0.5)]"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
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
                    className="mt-2 h-1 rounded-full bg-[hsl(var(--lesson-border)/0.4)] [&>div]:bg-gradient-to-r [&>div]:from-primary/70 [&>div]:to-[hsl(34_88%_62%/0.8)]"
                  />
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
                              'group/lesson flex items-center gap-2 rounded-xl px-2.5 py-2 text-[13px] transition-[background,color,box-shadow,transform] duration-200 hover:translate-x-0.5 motion-reduce:transform-none',
                              active
                                ? 'bg-primary/[0.13] font-semibold text-primary shadow-[inset_3px_0_0_hsl(var(--primary)),0_10px_22px_-18px_hsl(var(--primary)/0.5)] ring-1 ring-primary/20'
                                : 'text-muted-foreground hover:bg-[hsl(var(--lesson-glow)/0.55)] hover:text-foreground'
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
                              <Circle className="size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover/lesson:text-primary/50" />
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
        className="mt-auto inline-flex items-center justify-center rounded-full border border-[hsl(var(--lesson-border)/0.55)] bg-[hsl(var(--lesson-canvas)/0.58)] px-4 py-2.5 text-sm font-semibold text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-colors hover:bg-[hsl(var(--lesson-glow)/0.6)]"
      >
        {t('backToCourse')}
      </Link>
    </nav>
  );
}
