'use client';

import { createReactBlockSpec } from '@blocknote/react';
import type { Block, BlockNoteEditor } from '@blocknote/core';
import { useTranslations } from 'next-intl';
import {
  FG_LESSON_EXERCISE_BODY_MARKDOWN_CN,
  FG_LESSON_EXERCISE_SUCCESS_BODY_MARKDOWN_CN,
  LESSON_MARKDOWN_PROSE,
} from '@/components/courses/markdown-lesson-body';
import { FlowGuideBlockNoteMd } from '@/components/courses/flow-guide-blocknote-md-chunk';
import { cn } from '@/lib/utils';

type BnBlock = Block<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BnEditor = BlockNoteEditor<any, any, any>;

const fgOutcomesInner = cn(
  LESSON_MARKDOWN_PROSE,
  'fg-lesson-outcomes-inner',
  '[&_h2]:mt-0 [&_h2]:mb-4 [&_h2]:border-0 [&_h2]:pl-0 [&_h2]:text-[0.88rem] [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-[0.1em] [&_h2]:text-primary',
  '[&_h3]:mt-0 [&_h3]:mb-4 [&_h3]:border-0 [&_h3]:pl-0 [&_h3]:text-[0.88rem] [&_h3]:font-bold [&_h3]:uppercase [&_h3]:tracking-[0.1em] [&_h3]:text-primary',
  '[&_ul]:my-0 [&_ul]:space-y-0 [&_ul]:py-0'
);

function outcomesMarkdown(title: string, bulletsText: string): string {
  const bullets = bulletsText
    .split('\n')
    .map((l) => l.replace(/^\s*[-*]\s*/, '').trim())
    .filter(Boolean);
  const list = bullets.map((b) => `- ${b}`).join('\n');
  return [`## ${title}`, list].filter(Boolean).join('\n\n');
}

function FlowOutcomesView({ block, editor }: { block: BnBlock; editor: BnEditor }) {
  const title = String(block.props.title ?? '');
  const bulletsText = String(block.props.bulletsText ?? '');
  const editable = editor.isEditable;

  if (editable) {
    return (
      <section className="fg-lesson-outcomes rounded-xl border border-dashed border-primary/25 bg-muted/10 p-3">
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Outcomes title
        </label>
        <input
          type="text"
          className="mb-3 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
          value={title}
          onChange={(e) =>
            editor.updateBlock(block, {
              props: { ...block.props, title: e.target.value },
            })
          }
        />
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Bullets (one per line, optional leading “-”)
        </label>
        <textarea
          className="min-h-[100px] w-full rounded-lg border border-border bg-background px-2 py-1.5 font-mono text-xs leading-relaxed"
          value={bulletsText}
          onChange={(e) =>
            editor.updateBlock(block, {
              props: { ...block.props, bulletsText: e.target.value },
            })
          }
        />
      </section>
    );
  }

  const md = outcomesMarkdown(title, bulletsText);
  return (
    <section className="fg-lesson-outcomes">
      <FlowGuideBlockNoteMd markdown={md} className={fgOutcomesInner} />
    </section>
  );
}

function FlowKeyInsightView({ block, editor }: { block: BnBlock; editor: BnEditor }) {
  const label = String(block.props.label ?? '');
  const bodyMd = String(block.props.bodyMd ?? '');
  const editable = editor.isEditable;

  if (editable) {
    return (
      <div className="space-y-2 rounded-xl border border-dashed border-primary/25 bg-muted/10 p-3">
        <input
          type="text"
          placeholder="Label"
          className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm font-semibold"
          value={label}
          onChange={(e) =>
            editor.updateBlock(block, {
              props: { ...block.props, label: e.target.value },
            })
          }
        />
        <textarea
          placeholder="Body (markdown)"
          className="min-h-[88px] w-full rounded-lg border border-border bg-background px-2 py-1.5 font-mono text-xs"
          value={bodyMd}
          onChange={(e) =>
            editor.updateBlock(block, {
              props: { ...block.props, bodyMd: e.target.value },
            })
          }
        />
      </div>
    );
  }

  return (
    <blockquote>
      {label ? (
        <p className="mb-2">
          <strong>{label}</strong>
        </p>
      ) : null}
      <FlowGuideBlockNoteMd markdown={bodyMd} />
    </blockquote>
  );
}

type VignetteCol = { title: string; body: string };

function parseColumnsJson(raw: string): VignetteCol[] {
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v
      .map((row) => {
        if (!row || typeof row !== 'object') return null;
        const o = row as Record<string, unknown>;
        return {
          title: String(o.title ?? ''),
          body: String(o.body ?? ''),
        };
      })
      .filter(Boolean) as VignetteCol[];
  } catch {
    return [];
  }
}

function FlowVignetteView({ block, editor }: { block: BnBlock; editor: BnEditor }) {
  const kicker = String(block.props.kicker ?? '');
  const title = String(block.props.title ?? '');
  const introMd = String(block.props.introMd ?? '');
  const columnsJson = String(block.props.columnsJson ?? '[]');
  const editable = editor.isEditable;

  if (editable) {
    return (
      <div className="space-y-2 rounded-xl border border-dashed border-primary/25 bg-muted/10 p-3">
        <input
          type="text"
          placeholder="Kicker (e.g. Real example)"
          className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
          value={kicker}
          onChange={(e) =>
            editor.updateBlock(block, {
              props: { ...block.props, kicker: e.target.value },
            })
          }
        />
        <input
          type="text"
          placeholder="Title"
          className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm font-semibold"
          value={title}
          onChange={(e) =>
            editor.updateBlock(block, {
              props: { ...block.props, title: e.target.value },
            })
          }
        />
        <textarea
          placeholder="Intro (markdown)"
          className="min-h-[56px] w-full rounded-lg border border-border bg-background px-2 py-1.5 font-mono text-xs"
          value={introMd}
          onChange={(e) =>
            editor.updateBlock(block, {
              props: { ...block.props, introMd: e.target.value },
            })
          }
        />
        <textarea
          placeholder='Columns JSON: [{"title":"…","body":"md…"}, …]'
          className="min-h-[100px] w-full rounded-lg border border-border bg-background px-2 py-1.5 font-mono text-[11px]"
          value={columnsJson}
          onChange={(e) =>
            editor.updateBlock(block, {
              props: { ...block.props, columnsJson: e.target.value },
            })
          }
        />
      </div>
    );
  }

  const columns = parseColumnsJson(columnsJson);
  const innerProse = cn(
    LESSON_MARKDOWN_PROSE,
    '[&_p]:mb-3 [&_p]:last:mb-0 [&_ul]:my-2 [&_ol]:my-2'
  );

  return (
    <section className="fg-lesson-vignette">
      {kicker ? <p className="fg-lesson-vignette-kicker">{kicker}</p> : null}
      {title ? <h4 className="fg-lesson-vignette-title">{title}</h4> : null}
      {introMd.trim() ? (
        <div className="fg-lesson-vignette-intro">
          <FlowGuideBlockNoteMd markdown={introMd.trim()} className={innerProse} />
        </div>
      ) : null}
      <div className="fg-lesson-vignette-grid">
        {columns.map((col, idx) => (
          <div key={idx} className="fg-lesson-vignette-col">
            {col.title ? (
              <h5 className="fg-lesson-vignette-col-head">{col.title}</h5>
            ) : null}
            <FlowGuideBlockNoteMd
              markdown={col.body}
              className={cn(innerProse, 'text-[0.85rem]')}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function FlowFrameworkView({ block, editor }: { block: BnBlock; editor: BnEditor }) {
  const kicker = String(block.props.kicker ?? '');
  const title = String(block.props.title ?? '');
  const bodyMd = String(block.props.bodyMd ?? '');
  const editable = editor.isEditable;

  if (editable) {
    return (
      <div className="space-y-2 rounded-xl border border-dashed border-primary/25 bg-muted/10 p-3">
        <input
          type="text"
          placeholder="Framework label"
          className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs uppercase"
          value={kicker}
          onChange={(e) =>
            editor.updateBlock(block, {
              props: { ...block.props, kicker: e.target.value },
            })
          }
        />
        <input
          type="text"
          placeholder="Title"
          className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm font-semibold"
          value={title}
          onChange={(e) =>
            editor.updateBlock(block, {
              props: { ...block.props, title: e.target.value },
            })
          }
        />
        <textarea
          placeholder="Body markdown (numbered steps)"
          className="min-h-[120px] w-full rounded-lg border border-border bg-background px-2 py-1.5 font-mono text-xs"
          value={bodyMd}
          onChange={(e) =>
            editor.updateBlock(block, {
              props: { ...block.props, bodyMd: e.target.value },
            })
          }
        />
      </div>
    );
  }

  return (
    <section className="fg-lesson-framework">
      {kicker ? <p className="fg-lesson-framework-kicker">{kicker}</p> : null}
      {title ? <h4 className="fg-lesson-framework-title">{title}</h4> : null}
      {bodyMd.trim() ? (
        <FlowGuideBlockNoteMd
          markdown={bodyMd.trim()}
          className={cn(LESSON_MARKDOWN_PROSE, 'fg-lesson-framework-inner')}
        />
      ) : null}
    </section>
  );
}

function FlowPullQuoteView({ block, editor }: { block: BnBlock; editor: BnEditor }) {
  const bodyMd = String(block.props.bodyMd ?? '');
  const editable = editor.isEditable;

  if (editable) {
    return (
      <textarea
        placeholder="Quote (markdown)"
        className="min-h-[72px] w-full rounded-xl border border-dashed border-primary/25 bg-muted/10 p-3 font-mono text-sm"
        value={bodyMd}
        onChange={(e) =>
          editor.updateBlock(block, {
            props: { ...block.props, bodyMd: e.target.value },
          })
        }
      />
    );
  }

  return (
    <blockquote className="fg-lesson-pullquote">
      <FlowGuideBlockNoteMd
        markdown={bodyMd.trim()}
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

function FlowLessonExerciseView({ block, editor }: { block: BnBlock; editor: BnEditor }) {
  const t = useTranslations('dashboard.lessonViewer');
  const eyebrow = String(block.props.eyebrow ?? 'Lesson exercise');
  const title = String(block.props.title ?? '');
  const iconEmoji = String(block.props.iconEmoji ?? '✍️').trim() || '✍️';
  const introMd = String(block.props.introMd ?? '');
  const stepsMd = String(block.props.stepsMd ?? '');
  const successLabel = String(block.props.successLabel ?? '');
  const successBodyMd = String(block.props.successBodyMd ?? '');
  const editable = editor.isEditable;

  if (editable) {
    return (
      <section className="fg-lesson-exercise outline-none ring-1 ring-dashed ring-primary/30">
        <div className="fg-lesson-exercise-head">
          <div className="fg-lesson-exercise-icon">
            <input
              type="text"
              aria-label="Exercise icon"
              className="w-full border-0 bg-transparent p-0 text-center text-base leading-none outline-none focus:ring-0"
              value={iconEmoji}
              maxLength={8}
              onChange={(e) =>
                editor.updateBlock(block, {
                  props: { ...block.props, iconEmoji: e.target.value },
                })
              }
            />
          </div>
          <div className="fg-lesson-exercise-head-text space-y-1.5">
            <input
              type="text"
              placeholder="Eyebrow"
              className="fg-lesson-exercise-eyebrow w-full border-0 bg-transparent p-0 outline-none placeholder:text-primary/35 focus:ring-0"
              value={eyebrow}
              onChange={(e) =>
                editor.updateBlock(block, {
                  props: { ...block.props, eyebrow: e.target.value },
                })
              }
            />
            <input
              type="text"
              placeholder="Exercise title"
              className="fg-lesson-exercise-title w-full border-0 bg-transparent p-0 outline-none placeholder:text-muted-foreground focus:ring-0"
              value={title}
              onChange={(e) =>
                editor.updateBlock(block, {
                  props: { ...block.props, title: e.target.value },
                })
              }
            />
          </div>
        </div>
        <textarea
          placeholder="Intro (markdown)"
          className="mb-3 min-h-[52px] w-full resize-y rounded-lg border border-dashed border-border/80 bg-background/80 px-2 py-1.5 font-mono text-[0.75rem] leading-relaxed"
          value={introMd}
          onChange={(e) =>
            editor.updateBlock(block, {
              props: { ...block.props, introMd: e.target.value },
            })
          }
        />
        <textarea
          placeholder="Steps (markdown numbered list)"
          className="mb-3 min-h-[100px] w-full resize-y rounded-lg border border-dashed border-border/80 bg-background/80 px-2 py-1.5 font-mono text-[0.75rem] leading-relaxed"
          value={stepsMd}
          onChange={(e) =>
            editor.updateBlock(block, {
              props: { ...block.props, stepsMd: e.target.value },
            })
          }
        />
        <div className="fg-lesson-exercise-success">
          <input
            type="text"
            placeholder="Success label"
            className="fg-lesson-exercise-success-label mb-2 w-full border-0 bg-transparent p-0 outline-none placeholder:text-[hsl(var(--stat-done)/0.45)] focus:ring-0"
            value={successLabel}
            onChange={(e) =>
              editor.updateBlock(block, {
                props: { ...block.props, successLabel: e.target.value },
              })
            }
          />
          <textarea
            placeholder="Success body (markdown)"
            className="min-h-[52px] w-full resize-y rounded-lg border border-dashed border-border/80 bg-background/80 px-2 py-1.5 font-mono text-[0.75rem] leading-relaxed"
            value={successBodyMd}
            onChange={(e) =>
              editor.updateBlock(block, {
                props: { ...block.props, successBodyMd: e.target.value },
              })
            }
          />
        </div>
      </section>
    );
  }

  const stepsBlock =
    stepsMd.trim().length > 0 ? (
      <FlowGuideBlockNoteMd markdown={stepsMd.trim()} className={FG_LESSON_EXERCISE_BODY_MARKDOWN_CN} />
    ) : null;

  const successBlock =
    successBodyMd.trim().length > 0 ? (
      <div className="fg-lesson-exercise-success">
        <div className="fg-lesson-exercise-success-label">
          {successLabel.trim() || t('lessonExerciseSuccessLabel')}
        </div>
        <FlowGuideBlockNoteMd
          markdown={successBodyMd.trim()}
          className={FG_LESSON_EXERCISE_SUCCESS_BODY_MARKDOWN_CN}
        />
      </div>
    ) : null;

  return (
    <section className="fg-lesson-exercise">
      <div className="fg-lesson-exercise-head">
        <div className="fg-lesson-exercise-icon" aria-hidden>
          {iconEmoji}
        </div>
        <div className="fg-lesson-exercise-head-text">
          <div className="fg-lesson-exercise-eyebrow">{eyebrow}</div>
          {title ? <h4 className="fg-lesson-exercise-title">{title}</h4> : null}
        </div>
      </div>
      {introMd.trim() ? (
        <FlowGuideBlockNoteMd
          markdown={introMd.trim()}
          className={cn(LESSON_MARKDOWN_PROSE, 'mb-[1.25rem] text-[0.9rem] text-[hsl(var(--lesson-muted))]')}
        />
      ) : null}
      {stepsBlock}
      {successBlock}
    </section>
  );
}

export const flowOutcomesBlock = createReactBlockSpec(
  {
    type: 'flowOutcomes',
    propSchema: {
      title: { default: 'By the end of this lesson' },
      bulletsText: { default: '- First learning outcome\n- Second learning outcome' },
    },
    content: 'none',
  },
  {
    render: (props) => (
      <FlowOutcomesView block={props.block as BnBlock} editor={props.editor as BnEditor} />
    ),
  }
)();

export const flowKeyInsightBlock = createReactBlockSpec(
  {
    type: 'flowKeyInsight',
    propSchema: {
      label: { default: 'Key point' },
      bodyMd: { default: 'Add the insight learners should remember.' },
    },
    content: 'none',
  },
  {
    render: (props) => (
      <FlowKeyInsightView block={props.block as BnBlock} editor={props.editor as BnEditor} />
    ),
  }
)();

export const flowVignetteBlock = createReactBlockSpec(
  {
    type: 'flowVignette',
    propSchema: {
      kicker: { default: 'Real example' },
      title: { default: 'Scenario title' },
      introMd: { default: '' },
      columnsJson: {
        default:
          '[{"title":"Column A","body":"Short story."},{"title":"Column B","body":"Contrast."}]',
      },
    },
    content: 'none',
  },
  {
    render: (props) => (
      <FlowVignetteView block={props.block as BnBlock} editor={props.editor as BnEditor} />
    ),
  }
)();

export const flowFrameworkLessonBlock = createReactBlockSpec(
  {
    type: 'flowFramework',
    propSchema: {
      kicker: { default: 'Framework' },
      title: { default: 'Framework title' },
      bodyMd: { default: '1. **First:** Detail.\n\n2. **Second:** Detail.' },
    },
    content: 'none',
  },
  {
    render: (props) => (
      <FlowFrameworkView block={props.block as BnBlock} editor={props.editor as BnEditor} />
    ),
  }
)();

export const flowPullQuoteBlock = createReactBlockSpec(
  {
    type: 'flowPullQuote',
    propSchema: {
      bodyMd: { default: 'A short, bold line learners should carry with them.' },
    },
    content: 'none',
  },
  {
    render: (props) => (
      <FlowPullQuoteView block={props.block as BnBlock} editor={props.editor as BnEditor} />
    ),
  }
)();

export const flowLessonExerciseBlock = createReactBlockSpec(
  {
    type: 'flowLessonExercise',
    propSchema: {
      eyebrow: { default: 'Lesson exercise' },
      title: { default: 'Exercise title' },
      iconEmoji: { default: '✍️' },
      introMd: { default: '' },
      stepsMd: {
        default:
          '1. **Step one:** Describe what the learner does.\n\n2. **Step two:** Next action.',
      },
      successLabel: { default: "You'll know it worked when..." },
      successBodyMd: { default: '' },
    },
    content: 'none',
  },
  {
    render: (props) => (
      <FlowLessonExerciseView block={props.block as BnBlock} editor={props.editor as BnEditor} />
    ),
  }
)();
