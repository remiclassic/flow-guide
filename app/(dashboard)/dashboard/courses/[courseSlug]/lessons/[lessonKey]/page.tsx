import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { LegacyLessonFrame } from '@/components/courses/legacy-lesson-frame';
import { markLessonProgressAction } from '@/lib/courses/actions';
import { Button } from '@/components/ui/button';
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
  if (!teamHasCourseAccess(team)) {
    redirect('/pricing?reason=subscription');
  }

  const bundle = await getLessonByCourseSlugAndKey(courseSlug, lessonKey);
  if (!bundle) {
    notFound();
  }

  const outline = await getCourseOutline(bundle.course.id);
  const flatLessons = outline.flatMap((mod) =>
    mod.lessons.map((lesson) => ({
      lessonKey: lesson.lessonKey,
      title: lesson.titleEn,
    }))
  );
  const activeIndex = flatLessons.findIndex((l) => l.lessonKey === lessonKey);
  const previous = activeIndex > 0 ? flatLessons[activeIndex - 1] : null;
  const nextLesson =
    activeIndex >= 0 && activeIndex < flatLessons.length - 1
      ? flatLessons[activeIndex + 1]
      : null;

  const completedSet = await getCompletedLessonIdsForUser(user.id, [
    bundle.lesson.id,
  ]);
  const completed = completedSet.has(bundle.lesson.id);

  const legacySrc = `/legacy/course/${bundle.lesson.legacyHtmlPath}`;

  return (
    <section className="flex-1 space-y-4 p-4 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
            {bundle.module.titleEn}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
            {bundle.lesson.titleEn}
          </h1>
          <p className="text-sm text-muted-foreground">{bundle.lesson.titleEs}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild className="rounded-full">
            <Link href={`/dashboard/courses/${bundle.course.slug}`}>
              Outline
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
            <Button type="submit" className="rounded-full">
              {completed ? 'Mark as not done' : 'Mark complete'}
            </Button>
          </form>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        {previous ? (
          <Button variant="ghost" asChild className="rounded-full px-4">
            <Link
              href={`/dashboard/courses/${bundle.course.slug}/lessons/${previous.lessonKey}`}
            >
              ← Previous
            </Link>
          </Button>
        ) : (
          <span className="rounded-full px-4 py-2 text-muted-foreground">
            Start of course
          </span>
        )}
        {nextLesson ? (
          <Button variant="ghost" asChild className="rounded-full px-4">
            <Link
              href={`/dashboard/courses/${bundle.course.slug}/lessons/${nextLesson.lessonKey}`}
            >
              Next →
            </Link>
          </Button>
        ) : (
          <span className="rounded-full px-4 py-2 text-muted-foreground">
            Course complete
          </span>
        )}
      </div>

      <LegacyLessonFrame src={legacySrc} title={bundle.lesson.titleEn} />
    </section>
  );
}
