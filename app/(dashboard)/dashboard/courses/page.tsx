import Link from 'next/link';
import { redirect } from 'next/navigation';
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
  getCourseOutline,
  getPublishedCourses,
  getUser,
} from '@/lib/db/queries';

async function courseProgress(userId: number, courseId: number) {
  const outline = await getCourseOutline(courseId);
  const lessonIds = outline.flatMap((mod) => mod.lessons.map((l) => l.id));
  const done = await getCompletedLessonIdsForUser(userId, lessonIds);
  const completed = lessonIds.filter((id) => done.has(id)).length;
  return { completed, total: lessonIds.length };
}

export default async function CoursesLibraryPage() {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const rows = await getPublishedCourses();
  const items = await Promise.all(
    rows.map(async (course) => ({
      ...course,
      progress: await courseProgress(user.id, course.id),
    }))
  );

  return (
    <section className="flex-1 space-y-6 p-4 lg:p-8">
      <div>
        <h1 className="text-lg font-medium lg:text-2xl">Course library</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Structured programs with tracked completion. Lesson bodies currently
          load from the preserved legacy viewer until native MDX/React lessons
          land.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((course) => (
          <Card key={course.id} className="border-zinc-200 shadow-sm">
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              {course.description ? (
                <CardDescription>{course.description}</CardDescription>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold text-zinc-900">
                  {course.progress.completed}/{course.progress.total} lessons
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 transition-[width] duration-500"
                  style={{
                    width:
                      course.progress.total === 0
                        ? '0%'
                        : `${Math.round(
                            (course.progress.completed /
                              course.progress.total) *
                              100
                          )}%`,
                  }}
                />
              </div>
              <Button asChild className="w-full rounded-full">
                <Link href={`/dashboard/courses/${course.slug}`}>
                  Continue
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
