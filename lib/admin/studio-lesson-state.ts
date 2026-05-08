import type { Lesson } from '@/lib/db/schema';
import { lessonBlocksHaveContent } from '@/lib/courses/blocknote-content';

export function normalizeMarkdownBody(s: string | null | undefined): string {
  return (s ?? '').trim();
}

export function lessonMarkdownHasUnpublishedChanges(
  lesson: Pick<
    Lesson,
    | 'draftBodyMarkdown'
    | 'publishedBodyMarkdown'
    | 'draftBodyBlocks'
    | 'publishedBodyBlocks'
  >
): boolean {
  const draftBlocks = lessonBlocksHaveContent(lesson.draftBodyBlocks)
    ? JSON.stringify(lesson.draftBodyBlocks)
    : '';
  const publishedBlocks = lessonBlocksHaveContent(lesson.publishedBodyBlocks)
    ? JSON.stringify(lesson.publishedBodyBlocks)
    : '';
  return (
    draftBlocks !== publishedBlocks ||
    normalizeMarkdownBody(lesson.draftBodyMarkdown) !==
      normalizeMarkdownBody(lesson.publishedBodyMarkdown)
  );
}

/** Lesson appears in learner nav when published MD or legacy exists (existing product rule). */
export function lessonHasLearnerVisibleBody(
  lesson: Pick<
    Lesson,
    'publishedBodyMarkdown' | 'publishedBodyBlocks' | 'legacyHtmlPath' | 'deletedAt'
  >
): boolean {
  if (lesson.deletedAt != null) return false;
  return Boolean(
    lessonBlocksHaveContent(lesson.publishedBodyBlocks) ||
      normalizeMarkdownBody(lesson.publishedBodyMarkdown) ||
      (lesson.legacyHtmlPath ?? '').trim()
  );
}
