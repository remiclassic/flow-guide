/**
 * Pure helpers for course outline + lesson_progress-derived metrics.
 * XP / streak use placeholders until backed by schema.
 */

export type OutlineLessonLite = {
  id: number;
  lessonKey: string;
  titleEn: string;
};

export type OutlineModuleLite = {
  id: number;
  titleEn: string;
  lessons: OutlineLessonLite[];
};

/** Map Drizzle `getCourseOutline` rows to lite outline (progress helpers). */
export function toOutlineLite(
  outline: Array<{
    id: number;
    titleEn: string;
    lessons: Array<{ id: number; lessonKey: string; titleEn: string }>;
  }>
): OutlineModuleLite[] {
  return outline.map((m) => ({
    id: m.id,
    titleEn: m.titleEn,
    lessons: m.lessons.map((l) => ({
      id: l.id,
      lessonKey: l.lessonKey,
      titleEn: l.titleEn,
    })),
  }));
}

export function flattenLessonIds(outline: OutlineModuleLite[]): number[] {
  return outline.flatMap((m) => m.lessons.map((l) => l.id));
}

export function countCompletedLessonIds(
  lessonIds: number[],
  completedSet: ReadonlySet<number>
): number {
  return lessonIds.filter((id) => completedSet.has(id)).length;
}

export function completionRatio(
  completed: number,
  total: number
): { percent: number; completed: number; total: number } {
  if (total <= 0) {
    return { percent: 0, completed: 0, total: 0 };
  }
  const percent = Math.round((completed / total) * 100);
  return { percent, completed, total };
}

export type ModuleProgressRow = {
  moduleId: number;
  titleEn: string;
  completed: number;
  total: number;
  percent: number;
};

export function moduleProgressRows(
  outline: OutlineModuleLite[],
  completedSet: ReadonlySet<number>
): ModuleProgressRow[] {
  return outline.map((mod) => {
    const ids = mod.lessons.map((l) => l.id);
    const completed = countCompletedLessonIds(ids, completedSet);
    const { percent } = completionRatio(completed, ids.length);
    return {
      moduleId: mod.id,
      titleEn: mod.titleEn,
      completed,
      total: ids.length,
      percent,
    };
  });
}

export type NextLessonTarget = {
  lessonKey: string;
  titleEn: string;
  moduleTitleEn: string;
};

/** First lesson in syllabus order that is not completed. */
export function findNextIncompleteLesson(
  outline: OutlineModuleLite[],
  completedSet: ReadonlySet<number>
): NextLessonTarget | null {
  for (const mod of outline) {
    for (const lesson of mod.lessons) {
      if (!completedSet.has(lesson.id)) {
        return {
          lessonKey: lesson.lessonKey,
          titleEn: lesson.titleEn,
          moduleTitleEn: mod.titleEn,
        };
      }
    }
  }
  return null;
}

/** Lessons completed in order before this index (flat syllabus). */
export function flatLessonIndex(
  outline: OutlineModuleLite[],
  lessonKey: string
): number {
  let idx = 0;
  for (const mod of outline) {
    for (const lesson of mod.lessons) {
      if (lesson.lessonKey === lessonKey) return idx;
      idx++;
    }
  }
  return -1;
}

export function completedModulesCount(
  outline: OutlineModuleLite[],
  completedSet: ReadonlySet<number>
): number {
  return outline.filter((mod) =>
    mod.lessons.every((l) => completedSet.has(l.id))
  ).length;
}

/** Placeholder: 50 XP per completed lesson (tunable when XP table exists). */
export function placeholderXpFromLessons(completedLessons: number): number {
  return completedLessons * 50;
}

/** Placeholder level from completion percent (1–5 cap for display). */
export function placeholderLevelFromPercent(percent: number): number {
  if (percent >= 100) return 5;
  if (percent >= 80) return 4;
  if (percent >= 55) return 3;
  if (percent >= 25) return 2;
  return 1;
}

/** Rough minutes estimate per lesson until real durations exist in DB. */
export const ESTIMATED_MINUTES_PER_LESSON = 12;

export function estimateMinutesForLessons(lessonCount: number): number {
  return lessonCount * ESTIMATED_MINUTES_PER_LESSON;
}

/** DB teaser fields for courses listed before curriculum exists. */
export type CourseListingPreviewFields = {
  isComingSoon: boolean;
  previewModuleCount: number | null;
  previewLessonCount: number | null;
  previewEstMinutes: number | null;
};

export function courseListingCounts(
  course: CourseListingPreviewFields,
  outlineModuleCount: number,
  outlineLessonCount: number
): { moduleCount: number; lessonCount: number; estMinutes: number } {
  if (
    course.isComingSoon &&
    course.previewLessonCount != null &&
    course.previewLessonCount > 0
  ) {
    return {
      moduleCount: course.previewModuleCount ?? outlineModuleCount,
      lessonCount: course.previewLessonCount,
      estMinutes:
        course.previewEstMinutes ??
        estimateMinutesForLessons(course.previewLessonCount),
    };
  }
  return {
    moduleCount: outlineModuleCount,
    lessonCount: outlineLessonCount,
    estMinutes: estimateMinutesForLessons(outlineLessonCount),
  };
}

export function courseListingProgress(
  course: Pick<CourseListingPreviewFields, 'isComingSoon'>,
  completed: number,
  outlineLessonCount: number,
  effectiveLessonCount: number
): { percent: number; completed: number; total: number } {
  if (course.isComingSoon) {
    return completionRatio(0, effectiveLessonCount);
  }
  return completionRatio(completed, outlineLessonCount);
}

export function courseCtaLabel(completedLessons: number): 'Continue' | 'Start course' {
  return completedLessons > 0 ? 'Continue' : 'Start course';
}