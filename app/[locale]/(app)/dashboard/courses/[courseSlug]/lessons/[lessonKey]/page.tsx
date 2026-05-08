import Link from 'next/link';
import { redirectLocalized } from '@/lib/i18n/redirect-localized';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { LessonExperience } from '@/components/courses/lesson-experience';
import { markLessonProgressAction } from '@/lib/courses/actions';
import { lessonBlocksHaveContent } from '@/lib/courses/blocknote-content';
import {
  completionRatio,
  flattenLessonIds,
  toOutlineLite,
} from '@/lib/courses/progress';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  filterOutlineForLearner,
  getCompletedLessonIdsForUser,
  getCourseOutline,
  getLessonByCourseSlugAndKey,
  getTeamForUser,
  getUser,
  teamHasCourseAccess,
} from '@/lib/db/queries';
import { listLessonPlacementsOrdered } from '@/lib/db/queries-media';

type Params = { courseSlug: string; lessonKey: string };

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
        query: { reason: 'subscription' }
      }
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

  const headerAside = (
    <Card className="w-full shrink-0 border-border/80 shadow-card-soft lg:max-w-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">
          Lesson actions
        </CardTitle>
        <CardDescription>
          Track completion without leaving the lesson.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button variant="outline" asChild className="rounded-full border-border">
          <Link href={`/dashboard/courses/${bundle.course.slug}`}>
            <ArrowLeft className="size-4" />
            Back to roadmap
          </Link>
        </Button>
        <form action={markLessonProgressAction}>
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
      headerAside={headerAside}
    />
  );
}
