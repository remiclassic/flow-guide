import type { LegacyLessonExtract } from '@/lib/courses/legacy-html-extract';
import type { Lesson, LessonContentBlocks } from '@/lib/db/schema';

type InlineText = {
  type: 'text';
  text: string;
  styles: Record<string, boolean>;
};

type InlineLink = {
  type: 'link';
  href: string;
  content: InlineText[];
};

type InlineContent = InlineText | InlineLink;

export type PartialBlockJson = {
  type: string;
  props?: Record<string, unknown>;
  content?: string | InlineContent[];
  children?: PartialBlockJson[];
};

const SPECIAL_HEADING_PATTERNS: Array<{
  re: RegExp;
  type:
    | 'flowReflection'
    | 'flowActionStep'
    | 'flowExercise'
    | 'flowCallout'
    | 'flowJournalPrompt'
    | 'flowResourceDownload'
    | 'flowVideoEmbed';
}> = [
  { re: /\b(reflection|reflect|questions?)\b/i, type: 'flowReflection' },
  { re: /\b(action|next step|integration)\b/i, type: 'flowActionStep' },
  { re: /\b(exercise|practice|challenge|workout)\b/i, type: 'flowExercise' },
  { re: /\b(journal|meditation|prompt|breath)\b/i, type: 'flowJournalPrompt' },
  { re: /\b(resource|download|worksheet|workbook|pdf)\b/i, type: 'flowResourceDownload' },
  { re: /\b(video|watch|embed)\b/i, type: 'flowVideoEmbed' },
  { re: /\b(note|remember|key idea|callout)\b/i, type: 'flowCallout' },
];

function normalizeText(value: string): string {
  return value.replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').trim();
}

function stripMarkdownDecorators(value: string): string {
  return value
    .replace(/^\s{0,3}#{1,6}\s+/, '')
    .replace(/^\s*>\s?/, '')
    .replace(/^\s*[-*+]\s+/, '')
    .replace(/^\s*\d+[.)]\s+/, '')
    .trim();
}

function textNode(text: string, styles: Record<string, boolean> = {}): InlineText {
  return { type: 'text', text, styles };
}

export function parseInlineMarkdown(value: string): InlineContent[] {
  const input = normalizeText(value);
  if (!input) return [];

  const tokens: InlineContent[] = [];
  const pattern =
    /(\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(input))) {
    if (match.index > lastIndex) {
      tokens.push(textNode(input.slice(lastIndex, match.index)));
    }

    if (match[2] && match[3]) {
      tokens.push({
        type: 'link',
        href: match[3],
        content: [textNode(match[2])],
      });
    } else if (match[4]) {
      tokens.push(textNode(match[4], { code: true }));
    } else if (match[5]) {
      tokens.push(textNode(match[5], { bold: true }));
    } else if (match[6]) {
      tokens.push(textNode(match[6], { italic: true }));
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < input.length) {
    tokens.push(textNode(input.slice(lastIndex)));
  }

  return tokens.length ? tokens : [textNode(input)];
}

export function contentBlock(
  type: string,
  content: string,
  props?: Record<string, unknown>
): PartialBlockJson {
  return {
    type,
    props,
    content: parseInlineMarkdown(content),
  };
}

function paragraph(content: string): PartialBlockJson {
  return contentBlock('paragraph', content);
}

function customBlock(
  type: string,
  content: string,
  props: Record<string, unknown> = {}
): PartialBlockJson {
  return contentBlock(type, content, {
    resourceUrl: '',
    videoUrl: '',
    assetId: '',
    aiPromptId: '',
    ...props,
  });
}

function specialTypeForHeading(heading: string): string | null {
  return SPECIAL_HEADING_PATTERNS.find((entry) => entry.re.test(heading))?.type ?? null;
}

function flushParagraph(lines: string[], blocks: PartialBlockJson[]) {
  const body = normalizeText(lines.join(' '));
  if (body) blocks.push(paragraph(body));
  lines.length = 0;
}

function flushList(
  lines: string[],
  blocks: PartialBlockJson[],
  type: 'bulletListItem' | 'numberedListItem' | 'checkListItem'
) {
  for (const line of lines) {
    const cleaned = stripMarkdownDecorators(line).replace(/^\[[ xX]\]\s+/, '');
    if (!cleaned) continue;
    blocks.push(contentBlock(type, cleaned, type === 'checkListItem' ? { checked: /^\s*[-*+]\s+\[[xX]\]/.test(line) } : undefined));
  }
  lines.length = 0;
}

function flushQuote(lines: string[], blocks: PartialBlockJson[]) {
  const quote = normalizeText(lines.map((line) => line.replace(/^\s*>\s?/, '')).join('\n'));
  if (quote) blocks.push(contentBlock('quote', quote));
  lines.length = 0;
}

export function markdownToBlockNoteBlocks(markdown: string): LessonContentBlocks {
  const blocks: PartialBlockJson[] = [];
  const paragraphLines: string[] = [];
  const listLines: string[] = [];
  const quoteLines: string[] = [];
  let listType: 'bulletListItem' | 'numberedListItem' | 'checkListItem' | null = null;
  let codeFence: { language: string; lines: string[] } | null = null;
  let pendingSpecialHeading: { type: string; heading: string } | null = null;

  const closePending = () => {
    if (codeFence) {
      blocks.push(contentBlock('codeBlock', codeFence.lines.join('\n'), { language: codeFence.language }));
      codeFence = null;
    }
    if (quoteLines.length) flushQuote(quoteLines, blocks);
    if (listType && listLines.length) flushList(listLines, blocks, listType);
    listType = null;
    flushParagraph(paragraphLines, blocks);
  };

  const lines = normalizeText(markdown).split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      if (codeFence) {
        blocks.push(contentBlock('codeBlock', codeFence.lines.join('\n'), {
          language: codeFence.language,
        }));
        codeFence = null;
      } else {
        closePending();
        codeFence = { language: fence[1] ?? '', lines: [] };
      }
      continue;
    }
    if (codeFence) {
      codeFence.lines.push(rawLine);
      continue;
    }

    if (!line.trim()) {
      closePending();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      closePending();
      const headingText = stripMarkdownDecorators(heading[2] ?? '');
      const specialType = specialTypeForHeading(headingText);
      if (specialType) {
        pendingSpecialHeading = { type: specialType, heading: headingText };
      } else {
        blocks.push(contentBlock('heading', headingText, {
          level: Math.min(3, heading[1]!.length),
        }));
      }
      continue;
    }

    const divider = /^-{3,}$|^\*{3,}$|^_{3,}$/.test(line.trim());
    if (divider) {
      closePending();
      blocks.push({ type: 'divider' });
      continue;
    }

    const quote = /^\s*>/.test(line);
    if (quote) {
      flushParagraph(paragraphLines, blocks);
      if (listType && listLines.length) flushList(listLines, blocks, listType);
      listType = null;
      quoteLines.push(line);
      continue;
    }

    const checklist = /^\s*[-*+]\s+\[[ xX]\]\s+/.test(line);
    const bullet = /^\s*[-*+]\s+/.test(line);
    const numbered = /^\s*\d+[.)]\s+/.test(line);
    if (checklist || bullet || numbered) {
      flushParagraph(paragraphLines, blocks);
      if (quoteLines.length) flushQuote(quoteLines, blocks);
      const nextType = checklist
        ? 'checkListItem'
        : numbered
          ? 'numberedListItem'
          : 'bulletListItem';
      if (listType && listType !== nextType && listLines.length) {
        flushList(listLines, blocks, listType);
      }
      listType = nextType;
      listLines.push(line);
      continue;
    }

    if (pendingSpecialHeading) {
      closePending();
      blocks.push(
        customBlock(
          pendingSpecialHeading.type,
          `${pendingSpecialHeading.heading}: ${stripMarkdownDecorators(line)}`
        )
      );
      pendingSpecialHeading = null;
      continue;
    }

    paragraphLines.push(line);
  }

  closePending();
  if (pendingSpecialHeading) {
    blocks.push(customBlock(pendingSpecialHeading.type, pendingSpecialHeading.heading));
  }

  return blocks as LessonContentBlocks;
}

function splitMarkdownItems(value: string): string[] {
  return normalizeText(value)
    .split('\n')
    .map((line) => stripMarkdownDecorators(line))
    .filter(Boolean);
}

export function appendStructuredLessonBlocks(
  blocks: PartialBlockJson[],
  lesson: Pick<Lesson, 'reflectionPromptEn' | 'actionStepsEn'>,
  extracted?: Pick<LegacyLessonExtract, 'reflectionPromptEn' | 'actionStepsEn'> | null,
  opts?: { skipActionSteps?: boolean }
) {
  const reflection = lesson.reflectionPromptEn?.trim() || extracted?.reflectionPromptEn?.trim();
  if (reflection) {
    for (const item of splitMarkdownItems(reflection)) {
      blocks.push(customBlock('flowReflection', item));
    }
  }

  if (opts?.skipActionSteps) return;

  const action = lesson.actionStepsEn?.trim() || extracted?.actionStepsEn?.trim();
  if (action) {
    const type = /\bexercise\b|\d+\.\s+/i.test(action)
      ? 'flowExercise'
      : 'flowActionStep';
    for (const item of splitMarkdownItems(action)) {
      blocks.push(customBlock(type, item));
    }
  }
}

export function lessonToBlockNoteBlocks(args: {
  lesson: Pick<
    Lesson,
    | 'publishedBodyMarkdown'
    | 'draftBodyMarkdown'
    | 'reflectionPromptEn'
    | 'actionStepsEn'
  >;
  extracted?: Pick<
    LegacyLessonExtract,
    'bodyMarkdownEn' | 'reflectionPromptEn' | 'actionStepsEn'
  > | null;
}): LessonContentBlocks {
  const source =
    args.lesson.publishedBodyMarkdown?.trim() ||
    args.lesson.draftBodyMarkdown?.trim() ||
    args.extracted?.bodyMarkdownEn?.trim() ||
    '';

  const blocks = source ? [...markdownToBlockNoteBlocks(source)] : [];
  appendStructuredLessonBlocks(blocks as PartialBlockJson[], args.lesson, args.extracted);

  return blocks as LessonContentBlocks;
}
