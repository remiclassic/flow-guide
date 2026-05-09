'use client';

import { useTranslations } from 'next-intl';
import { PenLine, ListTodo } from 'lucide-react';
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
        'relative overflow-hidden rounded-3xl border border-violet-200/60 bg-gradient-to-br from-violet-50/90 via-white/60 to-fuchsia-50/40 p-6 shadow-[0_20px_50px_-38px_hsl(262_80%_40%/0.35)] dark:border-violet-500/20 dark:from-violet-950/40 dark:via-transparent dark:to-fuchsia-950/20',
        className
      )}
    >
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
        'rounded-3xl border border-amber-200/55 bg-gradient-to-br from-amber-50/85 via-white/70 to-orange-50/35 p-6 shadow-[0_18px_44px_-36px_hsl(28_80%_38%/0.28)] dark:border-amber-500/15 dark:from-amber-950/35 dark:via-transparent dark:to-orange-950/15',
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
        'my-12 rounded-3xl border border-[hsl(var(--lesson-border)/0.35)] bg-[hsl(var(--lesson-glow)/0.45)] px-6 py-10 text-center shadow-inner',
        className
      )}
    >
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
        'border-[hsl(var(--lesson-border)/0.4)] bg-[hsl(var(--lesson-wash)/0.55)] shadow-[0_18px_50px_-40px_hsl(var(--primary)/0.22)]',
        className
      )}
    />
  );
}
