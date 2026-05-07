import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
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
    redirect('/sign-in');
  }

  const team = await getTeamForUser();
  const unlocked = teamHasCourseAccess(team);

  const course = await getCourseBySlug(courseSlug);
  if (!course) {
    notFound();
  }

  const outline = await getCourseOutline(course.id);
  const lessonIds = outline.flatMap((mod) => mod.lessons.map((lesson) => lesson.id));
  const completedSet = await getCompletedLessonIdsForUser(user.id, lessonIds);

  return (
    <section className="flex-1 space-y-6 p-4 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            Course
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
            {course.title}
          </h1>
          {course.description ? (
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              {course.description}
            </p>
          ) : null}
        </div>
        {!unlocked ? (
          <Card className="w-full border-amber-200 bg-amber-50 lg:max-w-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-amber-900">
                Unlock full access
              </CardTitle>
              <CardDescription className="text-amber-900/80">
                Subscribe to open lessons, sync progress, and keep future
                drops available.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full rounded-full">
                <Link href="/pricing">View plans</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="space-y-5">
        {outline.map((mod) => (
          <Card key={mod.id} className="border-zinc-200">
            <CardHeader>
              <CardTitle className="text-lg">{mod.titleEn}</CardTitle>
              <CardDescription>{mod.titleEs}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {mod.lessons.map((lesson) => {
                const done = completedSet.has(lesson.id);
                const href = unlocked
                  ? `/dashboard/courses/${course.slug}/lessons/${lesson.lessonKey}`
                  : '/pricing?reason=subscription';

                return (
                  <Link
                    key={lesson.id}
                    href={href}
                    className="flex items-center justify-between rounded-lg border border-transparent px-3 py-2 text-sm transition hover:border-zinc-200 hover:bg-zinc-50"
                  >
                    <span className="font-medium text-zinc-900">
                      {lesson.titleEn}
                    </span>
                    <span
                      className={
                        done
                          ? 'text-xs font-semibold uppercase tracking-wide text-emerald-600'
                          : 'text-xs uppercase tracking-wide text-zinc-400'
                      }
                    >
                      {done ? 'Done' : 'Open'}
                    </span>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
