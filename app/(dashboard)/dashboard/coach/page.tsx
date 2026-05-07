/**
 * TODO(coach-ai): Optional server narrative layer — see `lib/coach/future.ts`.
 */
import {
  getCompletedLessonEventsForUser,
  getCompletedLessonIdsForUser,
  getCourseOutline,
  getPublishedCourses,
  getTeamForUser,
  getUser,
  primaryPlayableCourse,
  teamHasCourseAccess,
} from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { flattenLessonIds, toOutlineLite } from '@/lib/courses/progress';
import { buildCoachServerSnapshot } from '@/lib/coach/build-server-snapshot';
import type { CompletionEvent } from '@/lib/coach/analytics';
import { CoachDashboardClient } from './_components/coach-dashboard-client';

export default async function CoachDashboardPage() {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const team = await getTeamForUser();
  const unlocked = teamHasCourseAccess(team);

  const courses = await getPublishedCourses();
  const primary = primaryPlayableCourse(courses);

  let outlineRaw = [] as Awaited<ReturnType<typeof getCourseOutline>>;
  let completedSet = new Set<number>();
  let events: CompletionEvent[] = [];

  if (primary) {
    outlineRaw = await getCourseOutline(primary.id);
    const outlineLite = toOutlineLite(outlineRaw);
    const lessonIds = flattenLessonIds(outlineLite);
    completedSet = await getCompletedLessonIdsForUser(user.id, lessonIds);
    const rows = await getCompletedLessonEventsForUser(user.id, lessonIds);
    events = rows.map((r) => ({ lessonId: r.lessonId, completedAt: r.completedAt }));
  }

  const displayName = user.name?.trim() || user.email?.split('@')[0] || 'Learner';

  const snapshot = await buildCoachServerSnapshot({
    displayName,
    userId: user.id,
    unlocked,
    primary,
    outlineRaw,
    completionEvents: events,
    completedSet,
  });

  return (
    <section className="flex-1 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.08),transparent_34rem),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.32))] p-3 pb-10 sm:p-4 lg:p-6 lg:pb-10">
      <CoachDashboardClient snapshot={snapshot} />
    </section>
  );
}
