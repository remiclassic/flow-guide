'use client';

import { useCallback, useMemo, useState } from 'react';
import type { KnowledgeQuizData } from '@/lib/courses/knowledge-quiz';
import { cn } from '@/lib/utils';

const wrongDefault = {
  en: 'Not the best fit. Re-read the lesson to strengthen the idea.',
  es: 'No es la mejor opción. Repasa la lección para afianzar el concepto.',
};
const rightDefault = {
  en: 'Correct.',
  es: 'Correcto.',
};

type Props = {
  quiz: KnowledgeQuizData | null;
  className?: string;
};

export function KnowledgeQuizSection({ quiz, className }: Props) {
  const [picked, setPicked] = useState<Record<number, number | null>>({});

  const reset = useCallback(() => setPicked({}), []);

  const answeredCount = useMemo(
    () => Object.values(picked).filter((v) => v != null).length,
    [picked]
  );

  if (!quiz || quiz.items.length === 0) return null;

  const score = quiz.items.reduce((acc, item, idx) => {
    const p = picked[idx];
    return p != null && p === item.correctIndex ? acc + 1 : acc;
  }, 0);

  return (
    <section className={cn('fg-lesson-quiz', className)} aria-labelledby="kq-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2
          id="kq-heading"
          className="fg-lesson-quiz-heading text-lg font-semibold tracking-tight text-foreground"
        >
          <span className="block">Check your understanding</span>
          <span className="fg-lesson-quiz-sub mt-0.5 block text-base font-normal text-muted-foreground">
            Comprueba tu comprensión
          </span>
        </h2>
        {answeredCount > 0 ? (
          <button
            type="button"
            onClick={reset}
            className="shrink-0 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50"
          >
            Reset answers
          </button>
        ) : null}
      </div>

      {(quiz.introEn?.trim() || quiz.introEs?.trim()) ? (
        <div className="fg-lesson-quiz-intro mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
          {quiz.introEn?.trim() ? <p>{quiz.introEn.trim()}</p> : null}
          {quiz.introEs?.trim() ? (
            <p className="text-muted-foreground/90">{quiz.introEs.trim()}</p>
          ) : null}
        </div>
      ) : (
        <p className="fg-lesson-quiz-intro mt-4 text-sm leading-relaxed text-muted-foreground">
          Multiple-choice questions. They do not affect course progress — they
          help you see how clear the ideas are.
        </p>
      )}

      {answeredCount === quiz.items.length ? (
        <p
          className="mt-4 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm font-medium text-foreground"
          aria-live="polite"
        >
          Score: {score} / {quiz.items.length}
        </p>
      ) : null}

      <ol className="fg-lesson-quiz-items mt-6 list-none space-y-0 p-0">
        {quiz.items.map((item, qIdx) => {
          const choice = picked[qIdx];
          const showResult = choice != null;
          const isCorrect = showResult && choice === item.correctIndex;

          return (
            <li key={qIdx} className="space-y-3">
              <p className="fg-lesson-quiz-q text-base font-medium text-foreground">
                <span className="tabular-nums text-muted-foreground">
                  {qIdx + 1}.{' '}
                </span>
                {item.promptEn}
              </p>
              {item.promptEs?.trim() ? (
                <p className="text-sm text-muted-foreground">
                  {item.promptEs.trim()}
                </p>
              ) : null}

              <div className="flex flex-col gap-2" role="group">
                {item.options.map((opt, oIdx) => {
                  const selected = choice === oIdx;
                  const isThisCorrect = oIdx === item.correctIndex;
                  const highlight =
                    showResult &&
                    (isThisCorrect || (selected && !isThisCorrect));

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={showResult}
                      onClick={() =>
                        setPicked((prev) => ({ ...prev, [qIdx]: oIdx }))
                      }
                      className={cn(
                        'fg-lesson-quiz-opt rounded-xl border px-4 py-3 text-left text-sm transition',
                        'border-border bg-background hover:bg-muted/40',
                        selected && !showResult && 'border-primary/50 bg-primary/5',
                        highlight &&
                          isThisCorrect &&
                          'border-emerald-500/50 bg-emerald-50/80 dark:bg-emerald-950/30',
                        highlight &&
                          selected &&
                          !isThisCorrect &&
                          'border-destructive/40 bg-destructive/5'
                      )}
                    >
                      <span className="block font-medium text-foreground">
                        {opt.en}
                      </span>
                      {opt.es?.trim() ? (
                        <span className="mt-1 block text-muted-foreground">
                          {opt.es.trim()}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {showResult ? (
                <p
                  className={cn(
                    'text-sm',
                    isCorrect ? 'text-emerald-800 dark:text-emerald-200' : 'text-muted-foreground'
                  )}
                  aria-live="polite"
                >
                  {isCorrect ? (
                    <>
                      <span className="block">{rightDefault.en}</span>
                      <span className="mt-1 block">{rightDefault.es}</span>
                    </>
                  ) : (
                    <>
                      <span className="block">{wrongDefault.en}</span>
                      <span className="mt-1 block">{wrongDefault.es}</span>
                    </>
                  )}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
