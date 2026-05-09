'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import { useTranslations } from 'next-intl';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils';
import {
  parseFgFramework,
  parseFgVignette,
  splitFgExerciseSuccess,
  splitLeadingH2,
} from '@/lib/courses/lesson-markdown-fenced-parse';

type Props = {
  markdown: string;
  className?: string;
};

const FG_LANG_RE = /language-(fg-(?:outcomes|vignette|framework|exercise|pullquote))/;

/** Shared typography for lesson markdown (matches legacy course.css rhythm). */
export const LESSON_MARKDOWN_PROSE = cn(
  'text-[0.97rem] leading-[1.75] text-[hsl(var(--lesson-muted))]',
  '[&_h1]:mt-0 [&_h1]:mb-4 [&_h1]:text-[clamp(1.5rem,3vw,1.95rem)] [&_h1]:font-extrabold [&_h1]:tracking-[-0.03em] [&_h1]:leading-[1.15] [&_h1]:text-[hsl(var(--lesson-ink))]',
  '[&_h2]:mt-[2.75rem] [&_h2]:mb-4 [&_h2]:text-[clamp(1.35rem,2.6vw,1.95rem)] [&_h2]:font-extrabold [&_h2]:tracking-[-0.025em] [&_h2]:leading-[1.15] [&_h2]:text-[hsl(var(--lesson-ink))] [&_h2:first-child]:mt-0',
  '[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:border-l-2 [&_h3]:border-primary/35 [&_h3]:pl-4 [&_h3]:text-[clamp(1.05rem,2vw,1.32rem)] [&_h3]:font-bold [&_h3]:tracking-[-0.015em] [&_h3]:leading-snug [&_h3]:text-[hsl(var(--lesson-ink))] [&_h3:first-child]:mt-0',
  '[&_p]:mb-[1.1rem] [&_p]:last:mb-0 [&_p]:leading-[1.75] [&_p]:text-[hsl(var(--lesson-muted))]',
  '[&_a]:font-semibold [&_a]:text-primary [&_a]:underline-offset-[0.2em] hover:[&_a]:underline',
  '[&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2',
  '[&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2',
  '[&_li]:leading-[1.75] [&_li]:text-[hsl(var(--lesson-muted))] [&_li]:py-[0.25rem]',
  // Insight callout — not `.fg-lesson-pullquote`
  '[&_blockquote:not(.fg-lesson-pullquote)]:relative [&_blockquote:not(.fg-lesson-pullquote)]:my-7 [&_blockquote:not(.fg-lesson-pullquote)]:overflow-hidden [&_blockquote:not(.fg-lesson-pullquote)]:rounded-[10px]',
  '[&_blockquote:not(.fg-lesson-pullquote)]:border-0 [&_blockquote:not(.fg-lesson-pullquote)]:bg-[hsl(var(--primary)/0.05)] [&_blockquote:not(.fg-lesson-pullquote)]:pl-6 [&_blockquote:not(.fg-lesson-pullquote)]:pr-5 [&_blockquote:not(.fg-lesson-pullquote)]:py-5',
  '[&_blockquote:not(.fg-lesson-pullquote)]:border-l-[3px] [&_blockquote:not(.fg-lesson-pullquote)]:border-l-primary [&_blockquote:not(.fg-lesson-pullquote)]:not-italic [&_blockquote:not(.fg-lesson-pullquote)]:text-[hsl(var(--lesson-ink))] [&_blockquote:not(.fg-lesson-pullquote)]:leading-[1.75] [&_blockquote:not(.fg-lesson-pullquote)]:text-[0.9rem]',
  '[&_blockquote:not(.fg-lesson-pullquote)_p]:my-0 [&_blockquote:not(.fg-lesson-pullquote)_p+p]:mt-[0.65rem]',
  '[&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:text-foreground',
  '[&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border/70 [&_pre]:bg-muted/40 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:my-7',
  '[&_hr]:my-10 [&_hr]:border-[hsl(var(--lesson-border)/0.6)]',
  '[&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_table]:my-6',
  '[&_th]:border [&_th]:border-border/70 [&_th]:bg-muted/40 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold',
  '[&_td]:border [&_td]:border-border/70 [&_td]:px-3 [&_td]:py-2',
  '[&_strong]:font-semibold [&_strong]:text-[hsl(var(--lesson-ink))]',
  '[&_em]:italic [&_em]:text-[hsl(var(--lesson-muted))]'
);

/** Markdown inside lesson exercises (intro + numbered steps); shared with BlockNote reader. */
export const FG_LESSON_EXERCISE_BODY_MARKDOWN_CN = cn(
  LESSON_MARKDOWN_PROSE,
  'fg-lesson-exercise-body',
  '[&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-base',
  '[&_h3]:mt-0 [&_h3]:mb-2 [&_h3]:border-0 [&_h3]:pl-0 [&_h3]:text-[0.65rem] [&_h3]:font-bold [&_h3]:uppercase [&_h3]:tracking-[0.15em] [&_h3]:text-[hsl(var(--stat-done))]',
  '[&_hr]:my-8 [&_hr]:border-[hsl(var(--lesson-border)/0.5)]',
  '[&_hr+_h3]:mt-6 [&_p]:text-[hsl(var(--lesson-muted))]',
  '[&>p]:text-[0.9rem]'
);

export const FG_LESSON_EXERCISE_SUCCESS_BODY_MARKDOWN_CN = cn(
  LESSON_MARKDOWN_PROSE,
  'fg-lesson-exercise-success-body',
  '[&_p]:my-0 [&_p]:text-[0.85rem] [&_p]:leading-[1.65] [&_p]:text-[hsl(var(--lesson-muted))]',
  '[&_p+p]:mt-[0.65rem]'
);

function codePlain(children: ReactNode): string {
  return String(children).replace(/\n$/, '');
}

function LessonMarkdownTree({
  markdown,
  fencedBlockDepth,
  className,
}: {
  markdown: string;
  fencedBlockDepth: number;
  className?: string;
}) {
  const components = useMemo(
    () =>
      buildLessonMarkdownComponents({
        fencedBlockDepth,
      }),
    [fencedBlockDepth]
  );

  return (
    <div className={cn(className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={components}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

function buildLessonMarkdownComponents(opts: {
  fencedBlockDepth: number;
}): Components {
  const { fencedBlockDepth } = opts;

  return {
    code(props) {
      const { children, className: cnToken } = props;
      const inline = Boolean((props as { inline?: boolean }).inline);

      if (inline) {
        return (
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
            {children}
          </code>
        );
      }

      const match = FG_LANG_RE.exec(cnToken ?? '');
      const lang = match?.[1];
      const text = codePlain(children);

      if (lang && fencedBlockDepth === 0) {
        switch (lang) {
          case 'fg-outcomes':
            return (
              <section className="fg-lesson-outcomes">
                <LessonMarkdownTree
                  markdown={text}
                  fencedBlockDepth={fencedBlockDepth + 1}
                  className={cn(
                    LESSON_MARKDOWN_PROSE,
                    'fg-lesson-outcomes-inner',
                    '[&_h2]:mt-0 [&_h2]:mb-4 [&_h2]:border-0 [&_h2]:pl-0 [&_h2]:text-[0.88rem] [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-[0.1em] [&_h2]:text-primary',
                    '[&_h3]:mt-0 [&_h3]:mb-4 [&_h3]:border-0 [&_h3]:pl-0 [&_h3]:text-[0.88rem] [&_h3]:font-bold [&_h3]:uppercase [&_h3]:tracking-[0.1em] [&_h3]:text-primary',
                    '[&_ul]:my-0 [&_ul]:space-y-0 [&_ul]:py-0'
                  )}
                />
              </section>
            );
          case 'fg-vignette':
            return <FgVignetteBlock text={text} depth={fencedBlockDepth + 1} />;
          case 'fg-framework':
            return <FgFrameworkBlock text={text} depth={fencedBlockDepth + 1} />;
          case 'fg-exercise':
            return <FgExerciseBlock text={text} depth={fencedBlockDepth + 1} />;
          case 'fg-pullquote':
            return <FgPullquoteBlock text={text} depth={fencedBlockDepth + 1} />;
          default:
            break;
        }
      }

      return (
        <pre className="my-7 overflow-x-auto rounded-xl border border-border/70 bg-muted/40 p-4 text-sm">
          <code className={cnToken}>{children}</code>
        </pre>
      );
    },
  };
}

function FgVignetteBlock({ text, depth }: { text: string; depth: number }) {
  const parsed = parseFgVignette(text);
  const innerProse = cn(LESSON_MARKDOWN_PROSE, '[&_p]:mb-3 [&_p]:last:mb-0 [&_ul]:my-2 [&_ol]:my-2');

  return (
    <section className="fg-lesson-vignette">
      {parsed.kicker ? (
        <p className="fg-lesson-vignette-kicker">{parsed.kicker}</p>
      ) : null}
      {parsed.title ? (
        <h4 className="fg-lesson-vignette-title">{parsed.title}</h4>
      ) : null}
      {parsed.intro ? (
        <div className="fg-lesson-vignette-intro">
          <LessonMarkdownTree
            markdown={parsed.intro}
            fencedBlockDepth={depth}
            className={innerProse}
          />
        </div>
      ) : null}
      <div className="fg-lesson-vignette-grid">
        {parsed.columns.map((col, idx) => (
          <div key={idx} className="fg-lesson-vignette-col">
            {col.title ? (
              <h5 className="fg-lesson-vignette-col-head">{col.title}</h5>
            ) : null}
            <LessonMarkdownTree
              markdown={col.body}
              fencedBlockDepth={depth}
              className={cn(innerProse, 'text-[0.85rem]')}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function FgFrameworkBlock({ text, depth }: { text: string; depth: number }) {
  const parsed = parseFgFramework(text);
  return (
    <section className="fg-lesson-framework">
      {parsed.kicker ? (
        <p className="fg-lesson-framework-kicker">{parsed.kicker}</p>
      ) : null}
      {parsed.title ? (
        <h4 className="fg-lesson-framework-title">{parsed.title}</h4>
      ) : null}
      {parsed.bodyMd ? (
        <LessonMarkdownTree
          markdown={parsed.bodyMd}
          fencedBlockDepth={depth}
          className={cn(
            LESSON_MARKDOWN_PROSE,
            'fg-lesson-framework-inner'
          )}
        />
      ) : null}
    </section>
  );
}

function FgExerciseBlock({ text, depth }: { text: string; depth: number }) {
  const t = useTranslations('dashboard.lessonViewer');
  const { title, rest } = splitLeadingH2(text);
  const { mainMd, successLabel, successBodyMd } = splitFgExerciseSuccess(rest);

  return (
    <section className="fg-lesson-exercise">
      <div className="fg-lesson-exercise-head">
        <div className="fg-lesson-exercise-icon" aria-hidden>
          ✍️
        </div>
        <div className="fg-lesson-exercise-head-text">
          <div className="fg-lesson-exercise-eyebrow">{t('lessonExerciseEyebrow')}</div>
          {title ? <h4 className="fg-lesson-exercise-title">{title}</h4> : null}
        </div>
      </div>
      {mainMd.trim() ? (
        <LessonMarkdownTree
          markdown={mainMd.trim()}
          fencedBlockDepth={depth}
          className={FG_LESSON_EXERCISE_BODY_MARKDOWN_CN}
        />
      ) : null}
      {successBodyMd.trim() ? (
        <div className="fg-lesson-exercise-success">
          <div className="fg-lesson-exercise-success-label">
            {successLabel.trim() || t('lessonExerciseSuccessLabel')}
          </div>
          <LessonMarkdownTree
            markdown={successBodyMd.trim()}
            fencedBlockDepth={depth}
            className={FG_LESSON_EXERCISE_SUCCESS_BODY_MARKDOWN_CN}
          />
        </div>
      ) : null}
    </section>
  );
}

function FgPullquoteBlock({ text, depth }: { text: string; depth: number }) {
  return (
    <blockquote className="fg-lesson-pullquote">
      <LessonMarkdownTree
        markdown={text.trim()}
        fencedBlockDepth={depth}
        className={cn(
          LESSON_MARKDOWN_PROSE,
          'fg-lesson-pullquote-inner',
          '[&_p]:my-0 [&_p+p]:mt-2 [&_p]:text-center [&_p]:text-[clamp(1.05rem,2.4vw,1.35rem)] [&_p]:font-bold [&_p]:leading-snug [&_p]:tracking-[-0.01em] [&_p]:text-[hsl(var(--lesson-ink))]',
          '[&_em]:not-italic [&_em]:font-bold [&_em]:text-primary'
        )}
      />
    </blockquote>
  );
}

export function MarkdownLessonBody({ markdown, className }: Props) {
  return (
    <LessonMarkdownTree
      markdown={markdown}
      fencedBlockDepth={0}
      className={cn('w-full', LESSON_MARKDOWN_PROSE, className)}
    />
  );
}
