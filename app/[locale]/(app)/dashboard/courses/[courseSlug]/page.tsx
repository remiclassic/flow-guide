import { redirectLocalized } from '@/lib/i18n/redirect-localized';
import { notFound } from 'next/navigation';
import { CourseOverviewExperience } from '@/components/courses/course-overview-experience';
import { courseDescriptionForSlug } from '@/lib/courses/curriculum';
import {
  completionRatio,
  courseCtaLabel,
  findNextIncompleteLesson,
  flattenLessonIds,
  moduleProgressRows,
  toOutlineLite,
} from '@/lib/courses/progress';
import {
  filterOutlineForLearner,
  getCompletedLessonIdsForUser,
  getCourseBySlug,
  getCourseOutline,
  getTeamForUser,
  getUser,
  teamHasCourseAccess,
} from '@/lib/db/queries';

type Params = { courseSlug: string };

export default async function CourseOverviewPage(props: {
  params: Promise<Params>;
}) {
  const { courseSlug } = await props.params;
  const user = await getUser();
  if (!user) {
    return redirectLocalized({ href: '/sign-in' });
  }

  const team = await getTeamForUser();
  const course = await getCourseBySlug(courseSlug);
  if (!course) {
    notFound();
  }

  const unlocked =
    teamHasCourseAccess(team) || course.accessMode === 'free';

  const outlineRaw = await getCourseOutline(course.id);
  const outline = filterOutlineForLearner(outlineRaw);
  const outlineLite = toOutlineLite(outline);
  const lessonIds = flattenLessonIds(outlineLite);
  const completedSet = await getCompletedLessonIdsForUser(user.id, lessonIds);
  const ratio = completionRatio(
    lessonIds.filter((id) => completedSet.has(id)).length,
    lessonIds.length
  );
  const modRows = moduleProgressRows(outlineLite, completedSet);
  const nextLesson = findNextIncompleteLesson(outlineLite, completedSet);
  const cta = courseCtaLabel(ratio.completed);

  const continueHref = !unlocked
    ? '/pricing?reason=subscription'
    : nextLesson
      ? `/dashboard/courses/${course.slug}/lessons/${nextLesson.lessonKey}`
      : `/dashboard/courses/${course.slug}`;

  const overviewBlurb = courseDescriptionForSlug(course.slug, course.description);

  return (
    <CourseOverviewExperience
      courseTitle={course.title}
      overviewBlurb={overviewBlurb}
      unlocked={unlocked}
      outline={outline}
      ratio={ratio}
      modRows={modRows}
      completedSet={completedSet}
      nextLesson={nextLesson}
      continueHref={continueHref}
      cta={cta}
      lessonHref={(key) =>
        `/dashboard/courses/${course.slug}/lessons/${key}`
      }
    />
  );
}
