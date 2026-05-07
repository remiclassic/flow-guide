import {
  completedModulesCount,
  completionRatio,
  courseCtaLabel,
  estimateMinutesForLessons,
  findNextIncompleteLesson,
  flatLessonIndex,
  flattenLessonIds,
  moduleProgressRows,
  placeholderLevelFromPercent,
  toOutlineLite,
} from '@/lib/courses/progress';
import {
  computeCompletionStreakDays,
  completionsInRollingWindow,
  countCompletionsInUtcWeek,
  countCompletionsTodayUtc,
  countModulesFinishedInUtcWeek,
  daysSinceLastCompletion,
  findNearCompleteModule,
  findStrongestModuleTitle,
  type CompletionEvent,
} from '@/lib/coach/analytics';
import { courseDescriptionForSlug } from '@/lib/courses/curriculum';
import type { CoachServerSnapshot } from '@/lib/coach/types';

type CourseRow = { id: number; slug: string; title: string; description: string | null };
type OutlineRows = Awaited<ReturnType<typeof import('@/lib/db/queries').getCourseOutline>>;

export async function buildCoachServerSnapshot(args: {
  displayName: string;
  userId: number;
  unlocked: boolean;
  primary: CourseRow | null;
  outlineRaw: OutlineRows;
  completionEvents: CompletionEvent[];
  completedSet: ReadonlySet<number>;
  now?: Date;
}): Promise<CoachServerSnapshot> {
  void args.userId;
  const now = args.now ?? new Date();
  const { primary, unlocked } = args;

  if (!primary) {
    return emptySnapshot(args.displayName, args.unlocked);
  }

  const outlineLite = toOutlineLite(args.outlineRaw);
  const lessonIds = flattenLessonIds(outlineLite);
  const ratio = completionRatio(
    lessonIds.filter((id) => args.completedSet.has(id)).length,
    lessonIds.length
  );
  const nextLesson = findNextIncompleteLesson(outlineLite, args.completedSet);
  const modRows = moduleProgressRows(outlineLite, args.completedSet);
  const modulesDone = completedModulesCount(outlineLite, args.completedSet);
  const moduleTotal = outlineLite.length;

  const lessonOrdinal =
    nextLesson ? flatLessonIndex(outlineLite, nextLesson.lessonKey) : -1;
  const lessonPositionLabel =
    lessonOrdinal >= 0 ? `Lesson ${lessonOrdinal + 1} of ${ratio.total}` : null;

  const continueHref = !unlocked
    ? '/pricing?reason=subscription'
    : nextLesson
      ? `/dashboard/courses/${primary.slug}/lessons/${nextLesson.lessonKey}`
      : `/dashboard/courses/${primary.slug}`;

  const continueCtaLabel = !unlocked
    ? 'View plans'
    : nextLesson
      ? 'Continue lesson'
      : 'Open course';

  const courseCta = courseCtaLabel(ratio.completed);

  const events = args.completionEvents.filter((e) => lessonIds.includes(e.lessonId));

  const lessonsCompletedThisUtcWeek = countCompletionsInUtcWeek(events, now);
  const lessonsCompletedTodayUtc = countCompletionsTodayUtc(events, now);
  const completionStreakDays = computeCompletionStreakDays(events);
  const daysSince = daysSinceLastCompletion(events, now);

  let lastCompletedLessonTitle: string | null = null;
  let lastCompletionAtIso: string | null = null;
  if (events.length > 0) {
    const latest = events.reduce((a, b) =>
      a.completedAt > b.completedAt ? a : b
    );
    lastCompletionAtIso = latest.completedAt.toISOString();
    const lessonMeta = outlineLite
      .flatMap((m) => m.lessons.map((l) => ({ ...l, moduleTitleEn: m.titleEn })))
      .find((l) => l.id === latest.lessonId);
    lastCompletedLessonTitle = lessonMeta?.titleEn ?? null;
  }

  const xpPerLesson = 50;
  const xpModuleBonus = 150;
  const moduleBonusXp = modRows.filter((r) => r.percent === 100).length * xpModuleBonus;
  const xpPreview = ratio.completed * xpPerLesson + moduleBonusXp;

  const levelNum = placeholderLevelFromPercent(ratio.percent);
  const levelLabel =
    levelNum >= 4 ? 'Advanced' : levelNum >= 3 ? 'Intermediate' : 'Building momentum';

  const completionsLast7Days = completionsInRollingWindow(events, now, 0, 7);
  const completionsPrior7Days = completionsInRollingWindow(events, now, 7, 14);

  const strongestModuleTitle = findStrongestModuleTitle(modRows);
  const nearCompleteModule = findNearCompleteModule(modRows);
  const modulesCompletedThisUtcWeek = countModulesFinishedInUtcWeek(
    outlineLite,
    args.completedSet,
    events,
    now
  );

  const milestones = buildMilestones(ratio.percent, modulesDone, moduleTotal);

  const courseDescription =
    courseDescriptionForSlug(primary.slug, primary.description) ?? null;

  return {
    displayName: args.displayName,
    primaryCourseSlug: primary.slug,
    primaryCourseTitle: primary.title,
    unlocked,
    ratio,
    nextLesson,
    modRows,
    lessonPositionLabel,
    continueHref,
    continueCtaLabel,
    courseCtaLabel: courseCta,
    courseDescription,
    courseOverviewHref: `/dashboard/courses/${primary.slug}`,
    lessonsCompletedThisUtcWeek,
    lessonsCompletedTodayUtc,
    completionStreakDays,
    lastCompletionAtIso,
    lastCompletedLessonTitle,
    daysSinceLastCompletion: daysSince,
    estimatedMinutesRemaining: Math.round(
      estimateMinutesForLessons(Math.max(0, ratio.total - ratio.completed))
    ),
    modulesDone,
    moduleTotal,
    modulesCompletedThisUtcWeek,
    xpPreview,
    moduleBonusXp,
    levelNum,
    levelLabel,
    completionsLast7Days,
    completionsPrior7Days,
    strongestModuleTitle,
    nearCompleteModule,
    milestones,
  };
}

function emptySnapshot(displayName: string, unlocked: boolean): CoachServerSnapshot {
  return {
    displayName,
    primaryCourseSlug: null,
    primaryCourseTitle: null,
    unlocked,
    ratio: { percent: 0, completed: 0, total: 0 },
    nextLesson: null,
    modRows: [],
    lessonPositionLabel: null,
    continueHref: '/dashboard/courses',
    continueCtaLabel: 'Browse courses',
    courseCtaLabel: 'Browse',
    courseDescription: null,
    courseOverviewHref: null,
    lessonsCompletedThisUtcWeek: 0,
    lessonsCompletedTodayUtc: 0,
    completionStreakDays: 0,
    lastCompletionAtIso: null,
    lastCompletedLessonTitle: null,
    daysSinceLastCompletion: null,
    estimatedMinutesRemaining: 0,
    modulesDone: 0,
    moduleTotal: 0,
    modulesCompletedThisUtcWeek: 0,
    xpPreview: 0,
    moduleBonusXp: 0,
    levelNum: 1,
    levelLabel: 'Building momentum',
    completionsLast7Days: 0,
    completionsPrior7Days: 0,
    strongestModuleTitle: null,
    nearCompleteModule: null,
    milestones: [],
  };
}

function buildMilestones(
  percent: number,
  modulesDone: number,
  moduleTotal: number
): { id: string; title: string; done: boolean }[] {
  const thresholds: { id: string; pct: number; title: string }[] = [
    { id: 'course-25', pct: 25, title: 'A quarter of your path explored' },
    { id: 'course-50', pct: 50, title: 'Halfway through your lessons' },
    { id: 'course-75', pct: 75, title: 'Three quarters of the journey done' },
    { id: 'course-100', pct: 100, title: 'Your whole course, lesson by lesson' },
  ];
  return thresholds
    .map((row) => ({
      id: row.id,
      title: row.title,
      done: percent >= row.pct,
    }))
    .concat(
      moduleTotal > 0
        ? [
            {
              id: 'module-half',
              title: `Half your modules complete (${Math.ceil(moduleTotal / 2)}/${moduleTotal})`,
              done: modulesDone >= Math.ceil(moduleTotal / 2),
            },
          ]
        : []
    );
}
