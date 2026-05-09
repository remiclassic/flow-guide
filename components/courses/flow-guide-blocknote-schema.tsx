'use client';

import {
  BlockNoteSchema,
  defaultBlockSpecs,
  filterSuggestionItems,
  insertOrUpdateBlockForSlashMenu,
  type BlockNoteEditor,
} from '@blocknote/core';
import {
  createReactBlockSpec,
  getDefaultReactSlashMenuItems,
  type DefaultReactSuggestionItem,
} from '@blocknote/react';
import {
  BookOpen,
  Brain,
  ClipboardList,
  Columns2,
  Download,
  Dumbbell,
  Flame,
  LayoutList,
  Lightbulb,
  ListChecks,
  MessageSquareQuote,
  PlaySquare,
  Quote,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  flowOutcomesBlock,
  flowKeyInsightBlock,
  flowVignetteBlock,
  flowFrameworkLessonBlock,
  flowPullQuoteBlock,
  flowLessonExerciseBlock,
} from '@/components/courses/flow-guide-blocknote-legacy-blocks';

type FlowBlockTone =
  | 'reflection'
  | 'action'
  | 'exercise'
  | 'callout'
  | 'journal'
  | 'resource'
  | 'video';

const flowBlockMeta: Record<
  FlowBlockTone,
  { label: string; eyebrow: string; className: string }
> = {
  reflection: {
    label: 'Reflection',
    eyebrow: 'Pause and notice',
    className: 'flow-guide-blocknote-custom--reflection',
  },
  action: {
    label: 'Action step',
    eyebrow: 'Next move',
    className: 'flow-guide-blocknote-custom--action',
  },
  exercise: {
    label: 'Exercise',
    eyebrow: 'Practice',
    className: 'flow-guide-blocknote-custom--exercise',
  },
  callout: {
    label: 'Callout',
    eyebrow: 'Remember',
    className: 'flow-guide-blocknote-custom--callout',
  },
  journal: {
    label: 'Journal prompt',
    eyebrow: 'Write it down',
    className: 'flow-guide-blocknote-custom--journal',
  },
  resource: {
    label: 'Resource',
    eyebrow: 'Download',
    className: 'flow-guide-blocknote-custom--resource',
  },
  video: {
    label: 'Video',
    eyebrow: 'Watch',
    className: 'flow-guide-blocknote-custom--video',
  },
};

function FlowGuideBlockChrome({
  tone,
  contentRef,
}: {
  tone: FlowBlockTone;
  contentRef: (node: HTMLElement | null) => void;
}) {
  const meta = flowBlockMeta[tone];

  return (
    <div className={`flow-guide-blocknote-custom ${meta.className}`}>
      <div className="flow-guide-blocknote-custom__rail" aria-hidden />
      <div className="flow-guide-blocknote-custom__body">
        <div className="flow-guide-blocknote-custom__header">
          <span className="flow-guide-blocknote-custom__label">{meta.label}</span>
          <span className="flow-guide-blocknote-custom__eyebrow">
            {meta.eyebrow}
          </span>
        </div>
        <div ref={contentRef} className="flow-guide-blocknote-custom__content" />
      </div>
    </div>
  );
}

function createFlowBlock(type: string, tone: FlowBlockTone) {
  return createReactBlockSpec(
    {
      type,
      propSchema: {
        resourceUrl: { default: '' },
        videoUrl: { default: '' },
        assetId: { default: '' },
        aiPromptId: { default: '' },
      },
      content: 'inline',
    },
    {
      render: ({ contentRef }) => (
        <FlowGuideBlockChrome tone={tone} contentRef={contentRef} />
      ),
      toExternalHTML: ({ contentRef }) => (
        <FlowGuideBlockChrome tone={tone} contentRef={contentRef} />
      ),
    }
  )();
}

const flowReflection = createFlowBlock('flowReflection', 'reflection');
const flowActionStep = createFlowBlock('flowActionStep', 'action');
const flowExercise = createFlowBlock('flowExercise', 'exercise');
const flowCallout = createFlowBlock('flowCallout', 'callout');
const flowJournalPrompt = createFlowBlock('flowJournalPrompt', 'journal');
const flowResourceDownload = createFlowBlock('flowResourceDownload', 'resource');
const flowVideoEmbed = createFlowBlock('flowVideoEmbed', 'video');

export const flowGuideBlockNoteSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    flowOutcomes: flowOutcomesBlock,
    flowKeyInsight: flowKeyInsightBlock,
    flowVignette: flowVignetteBlock,
    flowFramework: flowFrameworkLessonBlock,
    flowPullQuote: flowPullQuoteBlock,
    flowLessonExercise: flowLessonExerciseBlock,
    flowReflection,
    flowActionStep,
    flowExercise,
    flowCallout,
    flowJournalPrompt,
    flowResourceDownload,
    flowVideoEmbed,
  },
});

type FlowGuideEditor = BlockNoteEditor<
  typeof flowGuideBlockNoteSchema.blockSchema,
  typeof flowGuideBlockNoteSchema.inlineContentSchema,
  typeof flowGuideBlockNoteSchema.styleSchema
>;

const allowedDefaultSlashTitles = new Set([
  'Heading 1',
  'Heading 2',
  'Heading 3',
  'Bullet List',
  'Numbered List',
  'Check List',
  'Quote',
  'Image',
  'Video',
  'File',
  'Divider',
  'Code Block',
]);

function insertFlowBlock(
  editor: FlowGuideEditor,
  type:
    | 'flowReflection'
    | 'flowActionStep'
    | 'flowExercise'
    | 'flowCallout'
    | 'flowJournalPrompt'
    | 'flowResourceDownload'
    | 'flowVideoEmbed',
  content: string
) {
  insertOrUpdateBlockForSlashMenu(editor, {
    type,
    content,
  });
}

function insertLegacyPropBlock(
  editor: FlowGuideEditor,
  type:
    | 'flowOutcomes'
    | 'flowKeyInsight'
    | 'flowVignette'
    | 'flowFramework'
    | 'flowPullQuote'
    | 'flowLessonExercise',
  props: Record<string, string>
) {
  insertOrUpdateBlockForSlashMenu(editor, {
    type,
    props,
  });
}

export function getFlowGuideSlashMenuItems(
  editor: FlowGuideEditor,
  query: string
): DefaultReactSuggestionItem[] {
  const defaultItems = getDefaultReactSlashMenuItems(editor).filter((item) =>
    allowedDefaultSlashTitles.has(item.title)
  );

  const flowItems: DefaultReactSuggestionItem[] = [
    {
      title: 'Lesson outcomes',
      subtext: '"By the end of this lesson" checklist (legacy outcomes box).',
      aliases: ['outcomes', 'objectives', 'goals'],
      group: 'Flow Guide',
      icon: <Target className="size-4" />,
      onItemClick: () =>
        insertLegacyPropBlock(editor, 'flowOutcomes', {
          title: 'By the end of this lesson',
          bulletsText: '- First learning outcome\n- Second learning outcome',
        }),
    },
    {
      title: 'Key insight callout',
      subtext: 'Labeled insight block (legacy key point / callout).',
      aliases: ['insight', 'key point', 'callout'],
      group: 'Flow Guide',
      icon: <Lightbulb className="size-4" />,
      onItemClick: () =>
        insertLegacyPropBlock(editor, 'flowKeyInsight', {
          label: 'Key point',
          bodyMd: 'The idea learners should remember from this section.',
        }),
    },
    {
      title: 'Real example (vignette)',
      subtext: 'Two-column story contrast (legacy vignette).',
      aliases: ['vignette', 'example', 'story'],
      group: 'Flow Guide',
      icon: <Columns2 className="size-4" />,
      onItemClick: () =>
        insertLegacyPropBlock(editor, 'flowVignette', {
          kicker: 'Real example',
          title: 'Scenario title',
          introMd: 'Short setup in one or two sentences.',
          columnsJson: JSON.stringify([
            { title: 'Without structure', body: 'What tends to happen.' },
            { title: 'With structure', body: 'What changes instead.' },
          ]),
        }),
    },
    {
      title: 'Framework steps',
      subtext: 'Numbered framework (legacy framework box).',
      aliases: ['framework', 'pillars', 'steps'],
      group: 'Flow Guide',
      icon: <LayoutList className="size-4" />,
      onItemClick: () =>
        insertLegacyPropBlock(editor, 'flowFramework', {
          kicker: 'Framework',
          title: 'Your framework title',
          bodyMd:
            '1. **First pillar:** What it means in practice.\n\n2. **Second pillar:** Supporting detail.',
        }),
    },
    {
      title: 'Featured quote',
      subtext: 'Large centered pull quote (legacy lesson quote).',
      aliases: ['pullquote', 'pull quote', 'banner quote'],
      group: 'Flow Guide',
      icon: <Quote className="size-4" />,
      onItemClick: () =>
        insertLegacyPropBlock(editor, 'flowPullQuote', {
          bodyMd: 'One bold line learners should carry with them.',
        }),
    },
    {
      title: 'Lesson exercise (structured)',
      subtext: 'Full lesson exercise with steps + success check (legacy exercise block).',
      aliases: ['lesson exercise', 'audit', 'worksheet'],
      group: 'Flow Guide',
      icon: <ClipboardList className="size-4" />,
      onItemClick: () =>
        insertLegacyPropBlock(editor, 'flowLessonExercise', {
          eyebrow: 'Lesson exercise',
          title: 'Short exercise title',
          iconEmoji: '✍️',
          introMd: 'Why this matters in one paragraph.',
          stepsMd:
            '1. **Step one:** What the learner writes or does.\n\n2. **Step two:** Follow-up prompt.',
          successLabel: "You'll know it worked when...",
          successBodyMd: 'Observable signal that the exercise landed.',
        }),
    },
    {
      title: 'Reflection block',
      subtext: 'Prompt learners to pause and connect the lesson to real life.',
      aliases: ['reflect', 'prompt', 'question'],
      group: 'Flow Guide',
      icon: <Brain className="size-4" />,
      onItemClick: () =>
        insertFlowBlock(editor, 'flowReflection', 'What do you notice now?'),
    },
    {
      title: 'Action step',
      subtext: 'Add one concrete next move for the learner.',
      aliases: ['action', 'step', 'todo'],
      group: 'Flow Guide',
      icon: <ListChecks className="size-4" />,
      onItemClick: () =>
        insertFlowBlock(editor, 'flowActionStep', 'Take one small action today.'),
    },
    {
      title: 'Exercise block',
      subtext: 'Frame a guided practice or short challenge.',
      aliases: ['exercise', 'practice', 'challenge'],
      group: 'Flow Guide',
      icon: <Dumbbell className="size-4" />,
      onItemClick: () =>
        insertFlowBlock(editor, 'flowExercise', 'Try this for five minutes.'),
    },
    {
      title: 'Quote / callout',
      subtext: 'Highlight an important idea with calm emphasis.',
      aliases: ['quote', 'callout', 'note'],
      group: 'Flow Guide',
      icon: <MessageSquareQuote className="size-4" />,
      onItemClick: () =>
        insertFlowBlock(editor, 'flowCallout', 'This is the idea to remember.'),
    },
    {
      title: 'Meditation / journal prompt',
      subtext: 'Add a grounded writing or meditation prompt.',
      aliases: ['journal', 'meditation', 'breath'],
      group: 'Flow Guide',
      icon: <Sparkles className="size-4" />,
      onItemClick: () =>
        insertFlowBlock(editor, 'flowJournalPrompt', 'Sit with this and write what comes up.'),
    },
    {
      title: 'Resource download',
      subtext: 'Placeholder for a PDF, worksheet, or linked course resource.',
      aliases: ['resource', 'download', 'pdf', 'worksheet'],
      group: 'Media',
      icon: <Download className="size-4" />,
      onItemClick: () =>
        insertFlowBlock(editor, 'flowResourceDownload', 'Attach a worksheet or resource.'),
    },
    {
      title: 'Video embed',
      subtext: 'Placeholder for an inline lesson video.',
      aliases: ['video', 'embed', 'media'],
      group: 'Media',
      icon: <PlaySquare className="size-4" />,
      onItemClick: () =>
        insertFlowBlock(editor, 'flowVideoEmbed', 'Add a video link or embed.'),
    },
  ];

  return filterSuggestionItems(
    [
      ...flowItems,
      ...defaultItems.map((item) =>
        item.title === 'File'
          ? {
              ...item,
              title: 'File / resource',
              icon: <BookOpen className="size-4" />,
            }
          : item.title === 'Code Block'
            ? { ...item, icon: <Flame className="size-4" /> }
            : item
      ),
    ],
    query
  );
}
