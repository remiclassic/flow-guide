import type { Lesson } from '@/lib/db/schema';
import { lessonBlocksHaveContent } from '@/lib/courses/blocknote-content';

/** Learners see a lesson only when it has published BlockNote, markdown, or legacy HTML and is not soft-deleted. */
export function lessonHasStudentVisibleContent(
  lesson: Pick<
    Lesson,
    'publishedBodyMarkdown' | 'publishedBodyBlocks' | 'legacyHtmlPath' | 'deletedAt'
  >
): boolean {
  if (lesson.deletedAt != null) return false;
  const md = lesson.publishedBodyMarkdown?.trim();
  const legacy = lesson.legacyHtmlPath?.trim();
  return Boolean(lessonBlocksHaveContent(lesson.publishedBodyBlocks) || md || legacy);
}
