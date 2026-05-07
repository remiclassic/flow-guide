import type { NextLessonTarget } from '@/lib/courses/progress';

export type CoachTone = 'calm' | 'motivational' | 'strategic' | 'direct';

export type ModuleProgressSnapshot = {
  moduleId: number;
  titleEn: string;
  completed: number;
  total: number;
  percent: number;
};

/** Serializable payload built on the server for the coach dashboard client. */
export type CoachServerSnapshot = {
  displayName: string;
  primaryCourseSlug: string | null;
  primaryCourseTitle: string | null;
  unlocked: boolean;
  ratio: { percent: number; completed: number; total: number };
  nextLesson: Pick<NextLessonTarget, 'lessonKey' | 'titleEn' | 'moduleTitleEn'> | null;
  modRows: ModuleProgressSnapshot[];
  lessonPositionLabel: string | null;
  continueHref: string;
  continueCtaLabel: string;
  courseCtaLabel: string;
  courseDescription: string | null;
  courseOverviewHref: string | null;
  lessonsCompletedThisUtcWeek: number;
  lessonsCompletedTodayUtc: number;
  /** Consecutive UTC days with ≥1 completion, anchored from most recent completion day. */
  completionStreakDays: number;
  lastCompletionAtIso: string | null;
  lastCompletedLessonTitle: string | null;
  daysSinceLastCompletion: number | null;
  estimatedMinutesRemaining: number;
  modulesDone: number;
  moduleTotal: number;
  modulesCompletedThisUtcWeek: number;
  xpPreview: number;
  moduleBonusXp: number;
  levelNum: number;
  levelLabel: string;
  /** Rolling 7d vs prior 7d completion counts (UTC-relative timestamps). */
  completionsLast7Days: number;
  completionsPrior7Days: number;
  strongestModuleTitle: string | null;
  /** Next module row where 0 < percent < 100, else null */
  nearCompleteModule: ModuleProgressSnapshot | null;
  milestones: { id: string; title: string; done: boolean }[];
};

export type DailyFocusKind =
  | 'next_lesson'
  | 'reflection'
  | 'reengage'
  | 'finish_module'
  | 'locked'
  | 'no_course'
  | 'course_complete'
  | 'empty_outline';

export type DailyFocusResult = {
  kind: DailyFocusKind;
  headline: string;
  sublabel: string;
  bullets: string[];
};
