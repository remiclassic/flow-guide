'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, CheckCircle2, ListTodo, PenLine, Sparkles } from 'lucide-react';
import { LessonSectionProse } from '@/components/courses/lesson-section-prose';
import { cn } from '@/lib/utils';
import { KnowledgeQuizSection } from '@/components/courses/knowledge-quiz-section';
import type { KnowledgeQuizData } from '@/lib/courses/knowledge-quiz';

export function ReflectionCard({
  markdown,
  className,
}: {
  markdown: string;
  className?: string;
}) {
  const t = useTranslations('dashboard.lessonViewer');
  return (
    <section
      className={cn(
        'rounded-2xl border border-[hsl(var(--lesson-border))] bg-[hsl(var(--lesson-wash)/0.55)] p-7 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.55)] dark:bg-[hsl(var(--lesson-wash)/0.35)] dark:shadow-none',
        className
      )}
    >
      <div className="mb-4 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <PenLine className="size-3.5 text-primary/80" aria-hidden />
          {t('reflectionSectionTitle')}
        </span>
      </div>
      <LessonSectionProse
        markdown={markdown}
        className="border-0 bg-transparent px-0 py-0 shadow-none [&_p]:text-[hsl(var(--lesson-muted))] [&_li]:text-[hsl(var(--lesson-muted))]"
      />
    </section>
  );
}

export function ActionStepsCard({
  markdown,
  className,
}: {
  markdown: string;
  className?: string;
}) {
  const t = useTranslations('dashboard.lessonViewer');
  return (
    <section
      className={cn(
        'lesson-action-steps-card rounded-2xl border border-primary/25 bg-[hsl(var(--lesson-canvas)/0.85)] px-8 py-10 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.5)] dark:bg-[hsl(var(--card)/0.5)] dark:shadow-none',
        className
      )}
    >
      <div className="mb-5 flex items-center gap-3">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-[hsl(var(--primary)/0.06)]"
          aria-hidden
        >
          <ListTodo className="size-4 text-primary" />
        </div>
        <div className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-primary">
          {t('actionSectionTitle')}
        </div>
      </div>
      <LessonSectionProse
        markdown={markdown}
        className="border-0 bg-transparent px-0 py-0 shadow-none [&_p]:text-[hsl(var(--lesson-muted))] [&_li]:text-[hsl(var(--lesson-muted))] [&_strong]:text-[hsl(var(--lesson-ink))]"
      />
    </section>
  );
}

export function PauseMoment({ className }: { className?: string }) {
  const t = useTranslations('dashboard.lessonViewer');
  return (
    <aside
      className={cn(
        'my-12 overflow-hidden rounded-[2rem] border border-[hsl(var(--lesson-border)/0.35)] bg-[radial-gradient(ellipse_70%_75%_at_50%_0%,hsl(var(--primary)/0.1),transparent_66%),hsl(var(--lesson-glow)/0.48)] px-6 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_22px_54px_-46px_hsl(var(--primary)/0.45)]',
        className
      )}
    >
      <Sparkles className="mx-auto mb-4 size-5 text-primary/70" aria-hidden />
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {t('pauseMomentTitle')}
      </p>
      <p className="mx-auto mt-4 max-w-md text-lg font-medium leading-relaxed text-[hsl(var(--lesson-ink))]">
        {t('pauseMomentBody')}
      </p>
    </aside>
  );
}

export function QuizSectionPremium({
  quiz,
  className,
}: {
  quiz: KnowledgeQuizData | null;
  className?: string;
}) {
  return (
    <KnowledgeQuizSection
      quiz={quiz}
      className={cn(
        'rounded-[2rem] border-[hsl(var(--lesson-border)/0.4)] bg-[linear-gradient(145deg,hsl(var(--lesson-wash)/0.68),hsl(var(--lesson-canvas)/0.72))] shadow-[0_22px_60px_-44px_hsl(var(--primary)/0.32)] ring-1 ring-white/35 dark:ring-white/10',
        className
      )}
    />
  );
}

export function ContinueJourneyCard({
  href,
  title,
  completed,
  className,
}: {
  href: string;
  title: string | null;
  completed: boolean;
  className?: string;
}) {
  const t = useTranslations('dashboard.lessonViewer');

  return (
    <section
      className={cn(
        'lesson-continue-journey-card relative overflow-hidden rounded-[2.25rem] border border-primary/20 bg-[radial-gradient(ellipse_70%_80%_at_15%_0%,hsl(var(--primary)/0.16),transparent_58%),linear-gradient(135deg,hsl(var(--lesson-wash)/0.78),hsl(var(--lesson-canvas)/0.84))] p-6 shadow-[0_30px_80px_-54px_hsl(var(--primary)/0.5)] ring-1 ring-white/35 sm:p-8 dark:ring-white/10',
        className
      )}
      aria-labelledby="continue-journey-title"
    >
      <div className="pointer-events-none absolute -right-20 -top-24 size-56 rounded-full bg-primary/15 blur-3xl" aria-hidden />
      <div className="relative grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            {completed ? (
              <CheckCircle2 className="size-3.5" aria-hidden />
            ) : (
              <Sparkles className="size-3.5" aria-hidden />
            )}
            {completed ? t('rewardComplete') : t('rewardInProgress')}
          </div>
          <div>
            <h2
              id="continue-journey-title"
              className="text-2xl font-semibold tracking-[-0.03em] text-[hsl(var(--lesson-ink))]"
            >
              {t('rewardTitle')}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[hsl(var(--lesson-muted))]">
              {title ? t('rewardBodyWithNext', { title }) : t('rewardBodyComplete')}
            </p>
          </div>
        </div>

        <Link
          href={href}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-[hsl(278_72%_52%)] px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_18px_40px_-22px_hsl(var(--primary)/0.8)] transition-[filter,transform] duration-200 hover:-translate-y-0.5 hover:brightness-105 motion-reduce:transform-none"
        >
          {title ? t('continueJourney') : t('backToCourse')}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
