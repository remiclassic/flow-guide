import type { KnowledgeQuizData } from '@/lib/courses/knowledge-quiz';
import type { Lesson } from '@/lib/db/schema';
import type { LessonContentBlocks } from '@/lib/db/schema';

/** Immutable lesson draft + metadata stored in `lesson_versions.snapshot` (JSONB). */
export type LessonVersionSnapshotV1 = {
  v: 1;
  draftBodyMarkdown: string | null;
  draftBodyBlocks: LessonContentBlocks | null;
  knowledgeQuizJson: KnowledgeQuizData | null;
  titleEn: string;
  titleEs: string;
  summaryEn: string | null;
  summaryEs: string | null;
  reflectionPromptEn: string | null;
  reflectionPromptEs: string | null;
  actionStepsEn: string | null;
  actionStepsEs: string | null;
  estimatedMinutes: number | null;
  legacyHtmlPath: string | null;
};

export type CourseVersionSnapshotV1 = {
  v: 1;
  title: string;
  description: string | null;
  heroImagePath: string | null;
  primaryLocale: string;
  accessMode: string;
  previewModuleCount: number | null;
  previewLessonCount: number | null;
  previewEstMinutes: number | null;
};

export function lessonRowToSnapshot(lesson: Lesson): LessonVersionSnapshotV1 {
  return {
    v: 1,
    draftBodyMarkdown: lesson.draftBodyMarkdown ?? null,
    draftBodyBlocks: lesson.draftBodyBlocks ?? null,
    knowledgeQuizJson: lesson.knowledgeQuizJson ?? null,
    titleEn: lesson.titleEn,
    titleEs: lesson.titleEs,
    summaryEn: lesson.summaryEn ?? null,
    summaryEs: lesson.summaryEs ?? null,
    reflectionPromptEn: lesson.reflectionPromptEn ?? null,
    reflectionPromptEs: lesson.reflectionPromptEs ?? null,
    actionStepsEn: lesson.actionStepsEn ?? null,
    actionStepsEs: lesson.actionStepsEs ?? null,
    estimatedMinutes: lesson.estimatedMinutes ?? null,
    legacyHtmlPath: lesson.legacyHtmlPath ?? null,
  };
}

export function courseRowToSnapshot(course: {
  title: string;
  description: string | null;
  heroImagePath: string | null;
  primaryLocale: string;
  accessMode: string;
  previewModuleCount: number | null;
  previewLessonCount: number | null;
  previewEstMinutes: number | null;
}): CourseVersionSnapshotV1 {
  return {
    v: 1,
    title: course.title,
    description: course.description ?? null,
    heroImagePath: course.heroImagePath ?? null,
    primaryLocale: course.primaryLocale,
    accessMode: course.accessMode,
    previewModuleCount: course.previewModuleCount ?? null,
    previewLessonCount: course.previewLessonCount ?? null,
    previewEstMinutes: course.previewEstMinutes ?? null,
  };
}
