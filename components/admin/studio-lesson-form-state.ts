import type { KnowledgeQuizData } from '@/lib/courses/knowledge-quiz';
import { normalizeKnowledgeQuizForStudio } from '@/lib/courses/knowledge-quiz';
import type { Lesson } from '@/lib/db/schema';

export type StudioLessonFieldsState = {
  titleEn: string;
  titleEs: string;
  summaryEn: string;
  summaryEs: string;
  reflectionPromptEn: string;
  reflectionPromptEs: string;
  actionStepsEn: string;
  actionStepsEs: string;
  estimatedMinutes: string;
  legacyHtmlPath: string;
  knowledgeQuiz: KnowledgeQuizData;
};

export function lessonToStudioFieldsState(
  lesson: Lesson
): StudioLessonFieldsState {
  return {
    titleEn: lesson.titleEn,
    titleEs: lesson.titleEs,
    summaryEn: lesson.summaryEn ?? '',
    summaryEs: lesson.summaryEs ?? '',
    reflectionPromptEn: lesson.reflectionPromptEn ?? '',
    reflectionPromptEs: lesson.reflectionPromptEs ?? '',
    actionStepsEn: lesson.actionStepsEn ?? '',
    actionStepsEs: lesson.actionStepsEs ?? '',
    estimatedMinutes:
      lesson.estimatedMinutes != null ? String(lesson.estimatedMinutes) : '',
    legacyHtmlPath: lesson.legacyHtmlPath ?? '',
    knowledgeQuiz: normalizeKnowledgeQuizForStudio(lesson.knowledgeQuizJson),
  };
}

export function studioFieldsFingerprint(lesson: Lesson): string {
  return JSON.stringify(lessonToStudioFieldsState(lesson));
}

export function studioLessonFieldsToFormData(
  courseSlug: string,
  lessonKey: string,
  f: StudioLessonFieldsState
): FormData {
  const fd = new FormData();
  fd.set('courseSlug', courseSlug);
  fd.set('lessonKey', lessonKey);
  fd.set('titleEn', f.titleEn);
  fd.set('titleEs', f.titleEs);
  fd.set('summaryEn', f.summaryEn);
  fd.set('summaryEs', f.summaryEs);
  fd.set('reflectionPromptEn', f.reflectionPromptEn);
  fd.set('reflectionPromptEs', f.reflectionPromptEs);
  fd.set('actionStepsEn', f.actionStepsEn);
  fd.set('actionStepsEs', f.actionStepsEs);
  fd.set('estimatedMinutes', f.estimatedMinutes);
  fd.set('legacyHtmlPath', f.legacyHtmlPath);
  fd.set('knowledgeQuizJson', JSON.stringify(f.knowledgeQuiz));
  return fd;
}
