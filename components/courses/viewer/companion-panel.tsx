'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookMarked,
  CheckCircle2,
  Download,
  Flame,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { markLessonProgressAction } from '@/lib/courses/actions';
import { buildLessonUrl } from '@/components/courses/lesson-experience';
import { cn } from '@/lib/utils';

type Props = {
  courseSlug: string;
  lessonKey: string;
  completed: boolean;
  takeaway: string | null;
  streakDays: number;
  streakSparkline: number[];
  nextLessonKey: string | null;
  nextLessonTitle: string | null;
  lessonLessonBasePath?: string;
  reflectionHref: string;
  previewNote?: string | null;
  className?: string;
};

export function CompanionPanel({
  courseSlug,
  lessonKey,
  completed,
  takeaway,
  streakDays,
  streakSparkline,
  nextLessonKey,
  nextLessonTitle,
  lessonLessonBasePath,
  reflectionHref,
  previewNote,
  className,
}: Props) {
  const t = useTranslations('dashboard.lessonViewer');
  const maxSpark = Math.max(1, ...streakSparkline, 1);
  const lessonArc = completed ? 1 : 0.42;

  return (
    <aside
      className={cn('flex flex-col gap-4', className)}
      aria-label={t('companionTitle')}
    >
      {previewNote ? (
        <p className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-950 dark:text-amber-100">
          {previewNote}
        </p>
      ) : null}

      <div className="rounded-xl border border-sidebar-border bg-muted/25 p-4 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.45)] dark:bg-muted/15 dark:shadow-none">
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-primary" aria-hidden />
          <p className="text-sm font-semibold text-sidebar-foreground">
            {completed ? t('completedLesson') : t('inProgressLesson')}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="relative grid size-[4.25rem] shrink-0 place-items-center">
            <svg className="col-start-1 row-start-1 size-[4.25rem] -rotate-90" viewBox="0 0 36 36" aria-hidden>
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-sidebar-border"
                strokeWidth="2.5"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-primary transition-[stroke-dashoffset] duration-500 ease-out"
                strokeWidth="2.5"
                strokeDasharray={97.4}
                strokeDashoffset={97.4 * (1 - lessonArc)}
                strokeLinecap="round"
              />
            </svg>
            <span className="col-start-1 row-start-1 text-[11px] font-semibold text-foreground">
              {completed ? '✓' : '···'}
            </span>
          </div>
          <form action={markLessonProgressAction} className="min-w-0 flex-1">
            <input type="hidden" name="courseSlug" value={courseSlug} />
            <input type="hidden" name="lessonKey" value={lessonKey} />
            <input type="hidden" name="completed" value={completed ? 'false' : 'true'} />
            <Button
              type="submit"
              className="h-11 w-full rounded-full border-0 bg-gradient-to-r from-primary to-[hsl(278_72%_52%)] text-sm font-semibold shadow-[0_14px_32px_-18px_hsl(var(--primary)/0.65)] transition-[filter,transform] duration-150 hover:brightness-105 active:scale-[0.99]"
            >
              {completed ? t('markIncomplete') : t('markComplete')}
            </Button>
          </form>
        </div>
      </div>

      <div className="rounded-xl border border-primary/15 bg-gradient-to-br from-primary/[0.09] via-sidebar-accent/80 to-transparent p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Flame className="size-4 text-[hsl(var(--stat-streak))]" aria-hidden />
          {t('streakLabel')}
        </div>
        <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
          {t('streakDays', { count: streakDays })}
        </p>
        <div className="mt-3 flex h-10 items-end gap-1" aria-hidden>
          {streakSparkline.map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-primary/25 transition-[height] duration-300"
              style={{
                height: `${Math.max(12, (v / maxSpark) * 100)}%`,
                opacity: 0.35 + (v / maxSpark) * 0.55,
              }}
            />
          ))}
        </div>
      </div>

      {takeaway?.trim() ? (
        <div className="rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/[0.09] via-muted/40 to-transparent p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="size-4 text-orange-600 dark:text-orange-400" aria-hidden />
            {t('keyInsight')}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{takeaway.trim()}</p>
        </div>
      ) : null}

      <div className="rounded-xl border border-sidebar-border bg-muted/25 p-4 dark:bg-muted/15">
        <div className="flex items-center gap-2 text-sm font-semibold text-sidebar-foreground">
          <MessageCircle className="size-4 text-primary" aria-hidden />
          {t('coachTitle')}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t('coachHint')}</p>
        <Button
          asChild
          variant="outline"
          className="mt-3 w-full rounded-full border-sidebar-border bg-background/80"
        >
          <Link href="/dashboard/ai-coach">{t('askCoach')}</Link>
        </Button>
      </div>

      <div className="rounded-[1.5rem] border border-[hsl(var(--lesson-border)/0.35)] bg-[hsl(var(--lesson-canvas)/0.58)] p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BookMarked className="size-4 text-primary" aria-hidden />
          {t('reflectTitle')}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t('reflectHint')}</p>
        <Button
          asChild
          variant="outline"
          className="mt-3 w-full rounded-full border-[hsl(var(--lesson-border)/0.55)] bg-background/80"
        >
          <Link href={reflectionHref}>{t('writeInJournal')}</Link>
        </Button>
      </div>

      <div className="rounded-xl border border-sidebar-border bg-muted/25 p-4 dark:bg-muted/15">
        <div className="flex items-center gap-2 text-sm font-semibold text-sidebar-foreground">
          <Download className="size-4 text-primary" aria-hidden />
          {t('resourcesTitle')}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {t('resourcesHint')}
        </p>
      </div>

      {nextLessonKey && nextLessonTitle ? (
        <Link
          href={buildLessonUrl(courseSlug, nextLessonKey, lessonLessonBasePath)}
          className="group flex gap-3 rounded-xl border border-sidebar-border bg-muted/25 p-3 transition-[border-color,background,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-muted/45 motion-reduce:transform-none dark:bg-muted/15"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {t('upNext')}
            </p>
            <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-foreground">
              {nextLessonTitle}
            </p>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
            <ArrowRight className="size-4" />
          </span>
        </Link>
      ) : null}
    </aside>
  );
}
