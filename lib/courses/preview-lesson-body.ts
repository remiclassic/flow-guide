import type { Lesson } from '@/lib/db/schema';
import {
  lessonBlocksHaveContent,
  type LessonBlocksJson,
} from '@/lib/courses/blocknote-content';

/**
 * Staff preview: prefer published body, fall back to draft so unpublished work-in-progress is visible.
 */
export function pickStaffPreviewLessonMarkdown(lesson: Lesson): string | null {
  const pub = lesson.publishedBodyMarkdown?.trim();
  if (pub) return pub;
  const draft = lesson.draftBodyMarkdown?.trim();
  if (draft) return draft;
  return null;
}

/**
 * Staff preview: prefer published BlockNote content, fall back to draft.
 */
export function pickStaffPreviewLessonBlocks(lesson: Lesson): LessonBlocksJson {
  if (lessonBlocksHaveContent(lesson.publishedBodyBlocks)) {
    return lesson.publishedBodyBlocks;
  }
  if (lessonBlocksHaveContent(lesson.draftBodyBlocks)) {
    return lesson.draftBodyBlocks;
  }
  return null;
}
