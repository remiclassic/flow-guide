import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { LegacyLessonFrame } from '@/components/courses/legacy-lesson-frame';
import { LessonRoadmapAside } from '@/components/courses/lesson-roadmap-aside';
import { markLessonProgressAction } from '@/lib/courses/actions';
import {
  completionRatio,
  flattenLessonIds,
  toOutlineLite,
} from '@/lib/courses/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  getCompletedLessonIdsForUser,
  getCourseOutline,
  getLessonByCourseSlugAndKey,
  getTeamForUser,
  getUser,
  teamHasCourseAccess,
} from '@/lib/db/queries';

type Params = { courseSlug: string; lessonKey: string };

export default async function LessonViewerPage(props: {
  params: Promise<Params>;
}) {
  const { courseSlug, lessonKey } = await props.params;

  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const team = await getTeamForUser();
  const unlocked = teamHasCourseAccess(team);
  if (!unlocked) {
    redirect('/pricing?reason=subscription');
  }

  const bundle = await getLessonByCourseSlugAndKey(courseSlug, lessonKey);
  if (!bundle) {
    notFound();
  }

  const outline = await getCourseOutline(bundle.course.id);
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

  const legacySrc = `/legacy/course/${bundle.lesson.legacyHtmlPath}`;
  const moduleIndex = outline.findIndex((m) => m.id === bundle.module.id);

  return (
    <section className="flex-1 space-y-8 p-4 lg:p-8 lg:pb-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full border-border font-medium normal-case">
              Module {moduleIndex >= 0 ? moduleIndex + 1 : '—'}
            </Badge>
            <Badge variant="secondary" className="rounded-full normal-case">
              {bundle.module.titleEn}
            </Badge>
            {completed ? (
              <Badge variant="success" className="rounded-full normal-case">
                Completed
              </Badge>
            ) : (
              <Badge variant="outline" className="rounded-full border-primary/35 normal-case text-primary">
                In progress
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {bundle.lesson.titleEn}
          </h1>
          <p className="text-base text-muted-foreground">{bundle.lesson.titleEs}</p>
          <div className="flex max-w-lg flex-col gap-2 pt-2">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>Learning path progress</span>
              <span className="tabular-nums">
                {ratio.completed}/{ratio.total} lessons
              </span>
            </div>
            <Progress value={ratio.percent} className="h-2.5" />
          </div>
        </div>

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
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {previous ? (
              <Button variant="ghost" asChild className="rounded-full text-muted-foreground hover:text-foreground">
                <Link href={`/dashboard/courses/${bundle.course.slug}/lessons/${previous}`}>
                  <ArrowLeft className="size-4" />
                  Previous
                </Link>
              </Button>
            ) : (
              <span className="rounded-full px-4 py-2 text-sm text-muted-foreground">
                Start of path
              </span>
            )}
            {nextLessonKey ? (
              <Button variant="ghost" asChild className="rounded-full text-muted-foreground hover:text-foreground">
                <Link href={`/dashboard/courses/${bundle.course.slug}/lessons/${nextLessonKey}`}>
                  Next lesson
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <span className="rounded-full px-4 py-2 text-sm text-muted-foreground">
                Path complete
              </span>
            )}
          </div>

          <LegacyLessonFrame src={legacySrc} title={bundle.lesson.titleEn} />
        </div>

        <LessonRoadmapAside
          courseSlug={bundle.course.slug}
          unlocked={unlocked}
          modules={roadmapModules}
          currentLessonKey={lessonKey}
        />
      </div>
    </section>
  );
}
