import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
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
  findNextIncompleteLesson,
  flattenLessonIds,
  toOutlineLite,
} from '@/lib/courses/progress';
import {
  completionsSparklineLast7DaysUtc,
  courseCompletionStreakDays,
} from '@/lib/courses/lesson-viewer-metrics';
import { toPlacementViewModels } from '@/lib/courses/map-lesson-placements';
import { getCompletedLessonEventsForUser, getCompletedLessonIdsForUser, getUser } from '@/lib/db/queries';
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

export default async function AdminCourseLessonPreviewPage(props: {
  params: Promise<Params>;
}) {
  const { courseSlug, lessonKey } = await props.params;

  const user = await getUser();
  if (!user) return redirectLocalized({ href: '/sign-in' });

  const tPreview = await getTranslations('dashboard.lessonViewer');

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
  const completionEvents = await getCompletedLessonEventsForUser(user.id, lessonIds);
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
  const placementModels = toPlacementViewModels(placementRows);
  const heroPlacement = placementModels.find(
    (p) => p.kind === 'image' || p.mediaKind === 'image'
  );
  const heroImageUrl = heroPlacement?.publicUrl?.trim() || null;
  const heroImageAlt = heroPlacement?.alt?.trim() || null;

  const previewBase = `/admin/courses/${bundle.course.slug}/preview`;

  const nextTarget = findNextIncompleteLesson(outlineLite, completedSet);
  const continueHref = nextTarget
    ? `${previewBase}/lessons/${nextTarget.lessonKey}`
    : previewBase;
  const continueTitle = nextTarget?.titleEn ?? null;

  const streakDays = courseCompletionStreakDays(completionEvents);
  const streakSparkline = completionsSparklineLast7DaysUtc(completionEvents);

  const lessonPosition =
    activeIndex >= 0 ? activeIndex + 1 : 1;
  const totalLessons = Math.max(flatLessons.length, 1);
  const nextLessonTitle = lessonTitleForKey(outline, nextLessonKey);

  const headerAside = (
    <Card className="w-full border-border/80 shadow-card-soft lg:max-w-xl">
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
    <LessonExperience
      courseSlug={bundle.course.slug}
      courseTitle={bundle.course.title}
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
      lessonPosition={lessonPosition}
      totalLessons={totalLessons}
      continueHref={continueHref}
      continueTitle={continueTitle}
      streakDays={streakDays}
      streakSparkline={streakSparkline}
      heroImageUrl={heroImageUrl}
      heroImageAlt={heroImageAlt}
      nextLessonTitle={nextLessonTitle}
      variant="preview"
      previewStaffNote={tPreview('previewStaffNote')}
      previewBanner={
        <div className="w-full space-y-4 pt-4 lg:pt-6">
          <AdminCoursePreviewBanner courseSlug={bundle.course.slug} />
          {headerAside}
        </div>
      }
    />
  );
}
