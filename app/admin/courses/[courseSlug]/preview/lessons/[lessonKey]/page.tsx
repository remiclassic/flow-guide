import Link from 'next/link';
import { notFound } from 'next/navigation';
import { redirectLocalized } from '@/lib/i18n/redirect-localized';
import { ArrowLeft } from 'lucide-react';
import { AdminCoursePreviewBanner } from '@/components/admin/admin-course-preview-banner';
import { LessonExperience } from '@/components/courses/lesson-experience';
import { markLessonProgressStaffPreviewAction } from '@/lib/admin/course-preview-actions';
import { filterOutlineForAdminPreview } from '@/lib/courses/outline-admin-preview';
import {
  pickStaffPreviewLessonBlocks,
  pickStaffPreviewLessonMarkdown,
} from '@/lib/courses/preview-lesson-body';
import {
  completionRatio,
  flattenLessonIds,
  toOutlineLite,
} from '@/lib/courses/progress';
import { getCompletedLessonIdsForUser, getUser } from '@/lib/db/queries';
import {
  getCourseOutlineForAdmin,
  getLessonByCourseSlugAndKeyForAdmin,
} from '@/lib/db/queries-admin';
import { listLessonPlacementsOrdered } from '@/lib/db/queries-media';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const dynamic = 'force-dynamic';

type Params = { courseSlug: string; lessonKey: string };

export default async function AdminCourseLessonPreviewPage(props: {
  params: Promise<Params>;
}) {
  const { courseSlug, lessonKey } = await props.params;

  const user = await getUser();
  if (!user) return redirectLocalized({ href: '/sign-in' });

  const bundle = await getLessonByCourseSlugAndKeyForAdmin(courseSlug, lessonKey);
  if (!bundle) notFound();

  const outlineRaw = await getCourseOutlineForAdmin(bundle.course.id);
  const outline = filterOutlineForAdminPreview(outlineRaw);

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

  const md = pickStaffPreviewLessonMarkdown(bundle.lesson);
  const blocks = pickStaffPreviewLessonBlocks(bundle.lesson);
  const legacyPath = bundle.lesson.legacyHtmlPath?.trim();
  const legacySrc = legacyPath ? `/legacy/course/${legacyPath}` : '';
  const moduleIndex = outline.findIndex((m) => m.id === bundle.module.id);

  const placementRows = await listLessonPlacementsOrdered(bundle.lesson.id);

  const previewBase = `/admin/courses/${bundle.course.slug}/preview`;

  const headerAside = (
    <Card className="w-full shrink-0 border-border/80 shadow-card-soft lg:max-w-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">
          Lesson actions
        </CardTitle>
        <CardDescription>
          Preview completion toggles your personal progress (staff tools).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button variant="outline" asChild className="rounded-full border-border">
          <Link href={previewBase}>
            <ArrowLeft className="size-4" />
            Back to roadmap
          </Link>
        </Button>
        <form action={markLessonProgressStaffPreviewAction}>
          <input type="hidden" name="courseSlug" value={courseSlug} />
          <input type="hidden" name="lessonKey" value={lessonKey} />
          <input
            type="hidden"
            name="completed"
            value={completed ? 'false' : 'true'}
          />
          <Button
            type="submit"
            className="w-full rounded-full btn-gradient-primary border-0 shadow-card-soft"
          >
            {completed ? 'Mark as not done' : 'Mark complete'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="px-4 pt-4 lg:px-8 lg:pt-8">
        <AdminCoursePreviewBanner courseSlug={bundle.course.slug} />
      </div>
      <LessonExperience
        courseSlug={bundle.course.slug}
        moduleTitleEn={bundle.module.titleEn}
        moduleIndexDisplay={moduleIndex}
        lesson={bundle.lesson}
        markdownBody={md ?? null}
        blockNoteBody={blocks}
        legacySrc={legacySrc || null}
        placementRows={placementRows}
        roadmapModules={roadmapModules}
        currentLessonKey={lessonKey}
        unlocked
        completed={completed}
        ratioCompleted={ratio.completed}
        ratioTotal={ratio.total}
        ratioPercent={ratio.percent}
        previousLessonKey={previous}
        nextLessonKey={nextLessonKey}
        lessonLessonBasePath={`${previewBase}/lessons`}
        headerAside={headerAside}
      />
    </>
  );
}
