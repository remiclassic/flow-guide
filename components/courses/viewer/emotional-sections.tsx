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
        'relative overflow-hidden rounded-[2rem] border border-violet-200/60 bg-gradient-to-br from-violet-50/95 via-white/70 to-fuchsia-50/45 p-6 shadow-[0_24px_64px_-44px_hsl(262_80%_40%/0.45)] ring-1 ring-white/45 dark:border-violet-500/20 dark:from-violet-950/45 dark:via-transparent dark:to-fuchsia-950/24 dark:ring-white/10',
        className
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-20 size-44 rounded-full bg-violet-400/15 blur-3xl" aria-hidden />
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-violet-900 dark:text-violet-100">
        <PenLine className="size-4 text-violet-600 dark:text-violet-300" aria-hidden />
        {t('reflectionSectionTitle')}
      </div>
      <LessonSectionProse
        markdown={markdown}
        className="border-0 bg-transparent px-0 py-0 shadow-none [&_p]:text-violet-950/85 dark:[&_p]:text-violet-50/85"
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
        'rounded-[2rem] border border-amber-200/55 bg-gradient-to-br from-amber-50/90 via-white/75 to-orange-50/40 p-6 shadow-[0_24px_60px_-44px_hsl(28_80%_38%/0.38)] ring-1 ring-white/45 dark:border-amber-500/15 dark:from-amber-950/40 dark:via-transparent dark:to-orange-950/20 dark:ring-white/10',
        className
      )}
    >
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-amber-950 dark:text-amber-100">
        <ListTodo className="size-4 text-amber-700 dark:text-amber-300" aria-hidden />
        {t('actionSectionTitle')}
      </div>
      <LessonSectionProse
        markdown={markdown}
        className="border-0 bg-transparent px-0 py-0 shadow-none"
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
        'relative overflow-hidden rounded-[2.25rem] border border-primary/20 bg-[radial-gradient(ellipse_70%_80%_at_15%_0%,hsl(var(--primary)/0.16),transparent_58%),linear-gradient(135deg,hsl(var(--lesson-wash)/0.78),hsl(var(--lesson-canvas)/0.84))] p-6 shadow-[0_30px_80px_-54px_hsl(var(--primary)/0.5)] ring-1 ring-white/35 sm:p-8 dark:ring-white/10',
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
