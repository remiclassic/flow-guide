import { redirectLocalized } from '@/lib/i18n/redirect-localized';
import { notFound } from 'next/navigation';
import { LessonExperience } from '@/components/courses/lesson-experience';
import { lessonBlocksHaveContent } from '@/lib/courses/blocknote-content';
import {
  completionRatio,
  findNextIncompleteLesson,
  flattenLessonIds,
  toOutlineLite,
} from '@/lib/courses/progress';
import {
  completionsSparklineLast7DaysUtc,
  courseCompletionStreakDays,
} from '@/lib/courses/lesson-viewer-metrics';
import { toPlacementViewModels } from '@/lib/courses/map-lesson-placements';
import {
  filterOutlineForLearner,
  getCompletedLessonEventsForUser,
  getCompletedLessonIdsForUser,
  getCourseOutline,
  getLessonByCourseSlugAndKey,
  getTeamForUser,
  getUser,
  teamHasCourseAccess,
} from '@/lib/db/queries';
import { listLessonPlacementsOrdered } from '@/lib/db/queries-media';

type Params = { courseSlug: string; lessonKey: string };

function lessonTitleForKey(
  outline: Array<{ lessons: Array<{ lessonKey: string; titleEn: string }> }>,
  key: string | null
): string | null {
  if (!key) return null;
  for (const mod of outline) {
    const hit = mod.lessons.find((l) => l.lessonKey === key);
    if (hit) return hit.titleEn;
  }
  return null;
}

export default async function LessonViewerPage(props: {
  params: Promise<Params>;
}) {
  const { courseSlug, lessonKey } = await props.params;

  const user = await getUser();
  if (!user) {
    return redirectLocalized({ href: '/sign-in' });
  }

  const team = await getTeamForUser();

  const bundle = await getLessonByCourseSlugAndKey(courseSlug, lessonKey);
  if (!bundle) {
    notFound();
  }

  const unlocked =
    teamHasCourseAccess(team) || bundle.course.accessMode === 'free';
  if (!unlocked) {
    return redirectLocalized({
      href: {
        pathname: '/pricing',
        query: { reason: 'subscription' },
      },
    });
  }

  const outlineRaw = await getCourseOutline(bundle.course.id);
  const outline = filterOutlineForLearner(outlineRaw);
  const outlineLite = toOutlineLite(outline);
  const flatLessons = outline.flatMap((mod) =>
    mod.lessons.map((lesson) => lesson.lessonKey)
  );
  const activeIndex = flatLessons.findIndex((key) => key === lessonKey);
  const previous = activeIndex > 0 ? flatLessons[activeIndex - 1] : null;
  const nextLessonKey =
    activeIndex >= 0 && activeIndex < flatLessons.length - 1
      ? flatLessons[activeIndex + 1]
      : null;
  const lessonIds = flattenLessonIds(outlineLite);
  const completedSet = await getCompletedLessonIdsForUser(user.id, lessonIds);
  const completionEvents = await getCompletedLessonEventsForUser(
    user.id,
    lessonIds
  );
  const completed = completedSet.has(bundle.lesson.id);
  const ratio = completionRatio(
    lessonIds.filter((id) => completedSet.has(id)).length,
    lessonIds.length
  );

  const roadmapModules = outline.map((mod) => ({
    id: mod.id,
    titleEn: mod.titleEn,
    lessons: mod.lessons.map((l) => ({
      lessonKey: l.lessonKey,
      titleEn: l.titleEn,
      done: completedSet.has(l.id),
    })),
  }));

  const publishedMd = bundle.lesson.publishedBodyMarkdown?.trim();
  const publishedBlocks = lessonBlocksHaveContent(bundle.lesson.publishedBodyBlocks)
    ? bundle.lesson.publishedBodyBlocks
    : null;
  const legacyPath = bundle.lesson.legacyHtmlPath?.trim();
  const legacySrc = legacyPath ? `/legacy/course/${legacyPath}` : '';
  const moduleIndex = outline.findIndex((m) => m.id === bundle.module.id);

  const placementRows = await listLessonPlacementsOrdered(bundle.lesson.id);
  const placementModels = toPlacementViewModels(placementRows);
  const heroPlacement = placementModels.find(
    (p) => p.kind === 'image' || p.mediaKind === 'image'
  );
  const heroImageUrl = heroPlacement?.publicUrl?.trim() || null;
  const heroImageAlt = heroPlacement?.alt?.trim() || null;

  const nextTarget = findNextIncompleteLesson(outlineLite, completedSet);
  const continueHref = nextTarget
    ? `/dashboard/courses/${bundle.course.slug}/lessons/${nextTarget.lessonKey}`
    : `/dashboard/courses/${bundle.course.slug}`;
  const continueTitle = nextTarget?.titleEn ?? null;

  const streakDays = courseCompletionStreakDays(completionEvents);
  const streakSparkline = completionsSparklineLast7DaysUtc(completionEvents);

  const lessonPosition =
    activeIndex >= 0 ? activeIndex + 1 : Math.max(1, flatLessons.length > 0 ? 1 : 1);
  const totalLessons = Math.max(flatLessons.length, 1);
  const nextLessonTitle = lessonTitleForKey(outline, nextLessonKey);

  return (
    <LessonExperience
      courseSlug={bundle.course.slug}
      courseTitle={bundle.course.title}
      moduleTitleEn={bundle.module.titleEn}
      moduleIndexDisplay={moduleIndex}
      lesson={bundle.lesson}
      markdownBody={publishedMd ?? null}
      blockNoteBody={publishedBlocks}
      legacySrc={legacySrc || null}
      placementRows={placementRows}
      roadmapModules={roadmapModules}
      currentLessonKey={lessonKey}
      unlocked={unlocked}
      completed={completed}
      ratioCompleted={ratio.completed}
      ratioTotal={ratio.total}
      ratioPercent={ratio.percent}
      previousLessonKey={previous}
      nextLessonKey={nextLessonKey}
      lessonPosition={lessonPosition}
      totalLessons={totalLessons}
      continueHref={continueHref}
      continueTitle={continueTitle}
      streakDays={streakDays}
      streakSparkline={streakSparkline}
      heroImageUrl={heroImageUrl}
      heroImageAlt={heroImageAlt}
      nextLessonTitle={nextLessonTitle}
      variant="learner"
    />
  );
}
