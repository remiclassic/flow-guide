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

  const previewBar = (
    <div className="flex w-full flex-wrap items-center gap-2 sm:gap-3">
      {/* Left: label */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <FlaskConical className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
        <span className="truncate text-[11px] font-semibold text-amber-800 dark:text-amber-200">
          Admin preview — unlocked customer view
        </span>
      </div>

      {/* Right: language + actions */}
      <div className="flex shrink-0 items-center gap-2">
        <LanguageSwitcher />
        <form action={markLessonProgressStaffPreviewAction} className="contents">
          <input type="hidden" name="courseSlug" value={courseSlug} />
          <input type="hidden" name="lessonKey" value={lessonKey} />
          <input type="hidden" name="completed" value={completed ? 'false' : 'true'} />
          <Button
            type="submit"
            size="sm"
            variant="outline"
            className="h-7 rounded-full border-amber-400/60 bg-white/70 px-3 text-[11px] font-semibold text-amber-900 hover:bg-amber-100/80 dark:border-amber-600/40 dark:bg-amber-900/30 dark:text-amber-100"
          >
            {completed ? (
              <><CheckCircle2 className="mr-1 size-3.5 text-emerald-600" aria-hidden />Mark undone</>
            ) : (
              <><Circle className="mr-1 size-3.5" aria-hidden />Mark complete</>
            )}
          </Button>
        </form>

        <Button
          size="sm"
          variant="outline"
          className="h-7 rounded-full border-amber-400/60 bg-white/70 px-3 text-[11px] font-semibold text-amber-900 hover:bg-amber-100/80 dark:border-amber-600/40 dark:bg-amber-900/30 dark:text-amber-100"
          asChild
        >
          <Link href={`/admin/courses/${courseSlug}/studio`}>
            <ArrowLeft className="mr-1 size-3.5" aria-hidden />
            Back to Studio
          </Link>
        </Button>
      </div>
    </div>
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
      previewBanner={previewBar}
    />
  );
}
