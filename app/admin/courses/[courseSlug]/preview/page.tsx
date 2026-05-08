import { notFound } from 'next/navigation';
import { redirectLocalized } from '@/lib/i18n/redirect-localized';
import { AdminCoursePreviewBanner } from '@/components/admin/admin-course-preview-banner';
import { CourseOverviewExperience } from '@/components/courses/course-overview-experience';
import { courseDescriptionForSlug } from '@/lib/courses/curriculum';
import { lessonHasStudentVisibleContent } from '@/lib/courses/lesson-content';
import { filterOutlineForAdminPreview } from '@/lib/courses/outline-admin-preview';
import {
  completionRatio,
  courseCtaLabel,
  findNextIncompleteLesson,
  flattenLessonIds,
  moduleProgressRows,
  toOutlineLite,
} from '@/lib/courses/progress';
import { getCompletedLessonIdsForUser, getUser } from '@/lib/db/queries';
import {
  getAdminCourseBySlug,
  getCourseOutlineForAdmin,
} from '@/lib/db/queries-admin';

export const dynamic = 'force-dynamic';

type Params = { courseSlug: string };

export default async function AdminCoursePreviewPage(props: {
  params: Promise<Params>;
}) {
  const { courseSlug } = await props.params;

  const course = await getAdminCourseBySlug(courseSlug);
  if (!course) notFound();

  const user = await getUser();
  if (!user) return redirectLocalized({ href: '/sign-in' });

  const outlineRaw = await getCourseOutlineForAdmin(course.id);
  const outline = filterOutlineForAdminPreview(outlineRaw);

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

  const previewBase = `/admin/courses/${course.slug}/preview`;
  const continueHref = nextLesson
    ? `${previewBase}/lessons/${nextLesson.lessonKey}`
    : previewBase;

  const overviewBlurb = courseDescriptionForSlug(course.slug, course.description);

  const draftLessonIds = new Set(
    outline.flatMap((m) =>
      m.lessons
        .filter((l) => !lessonHasStudentVisibleContent(l))
        .map((l) => l.id)
    )
  );

  return (
    <CourseOverviewExperience
      banner={<AdminCoursePreviewBanner courseSlug={course.slug} />}
      courseTitle={course.title}
      overviewBlurb={overviewBlurb}
      unlocked
      outline={outline}
      ratio={ratio}
      modRows={modRows}
      completedSet={completedSet}
      nextLesson={nextLesson}
      continueHref={continueHref}
      cta={cta}
      lessonHref={(key) => `${previewBase}/lessons/${key}`}
      draftLessonIds={draftLessonIds}
    />
  );
}
