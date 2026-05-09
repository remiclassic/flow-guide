import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { redirectLocalized } from '@/lib/i18n/redirect-localized';
import { ArrowLeft, CheckCircle2, Circle, FlaskConical } from 'lucide-react';
import { LessonExperience } from '@/components/courses/lesson-experience';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';
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

  /** Ephemeral utility strip — muted, minimal (see LessonViewerShell). */
  const previewRibbon = (
    <div className="flex min-w-0 items-center gap-1.5">
      <FlaskConical
        className="size-3 shrink-0 text-muted-foreground/70"
        aria-hidden
      />
      <span className="truncate text-[10px] font-medium tracking-wide text-muted-foreground">
        Preview · customer view (staff only)
      </span>
    </div>
  );

  /** Inline staff controls — composed into one chrome row with breadcrumbs + completion. */
  const previewToolbar = (
    <>
      <LanguageSwitcher compact />
      <form action={markLessonProgressStaffPreviewAction} className="contents">
        <input type="hidden" name="courseSlug" value={courseSlug} />
        <input type="hidden" name="lessonKey" value={lessonKey} />
        <input type="hidden" name="completed" value={completed ? 'false' : 'true'} />
        <Button
          type="submit"
          size="sm"
          variant="outline"
          className="h-8 shrink-0 rounded-md border-border/50 bg-transparent px-2.5 text-[11px] font-medium shadow-none hover:bg-muted/40"
        >
          {completed ? (
            <>
              <CheckCircle2 className="mr-1 size-3 text-emerald-600" aria-hidden />
              Undo
            </>
          ) : (
            <>
              <Circle className="mr-1 size-3" aria-hidden />
              Complete
            </>
          )}
        </Button>
      </form>

      <Button
        size="sm"
        variant="outline"
        className="h-8 shrink-0 rounded-md border-border/50 bg-transparent px-2.5 text-[11px] font-medium shadow-none hover:bg-muted/40"
        asChild
      >
        <Link href={`/admin/courses/${courseSlug}/studio`}>
          <ArrowLeft className="mr-1 size-3" aria-hidden />
          Studio
        </Link>
      </Button>
    </>
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
      previewBanner={previewRibbon}
      previewToolbar={previewToolbar}
    />
  );
}
