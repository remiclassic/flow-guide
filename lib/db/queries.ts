import {
  desc,
  and,
  eq,
  isNull,
  isNotNull,
  inArray,
  asc,
} from 'drizzle-orm';
import { db } from './drizzle';
import {
  activityLogs,
  courseModules,
  courses,
  lessonProgress,
  lessons,
  teamMembers,
  teams,
  users,
  type Team,
} from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result?.team || null;
}

/** Active Stripe subscription or trial unlocks course content. */
export function teamHasCourseAccess(team: Team | null): boolean {
  const status = team?.subscriptionStatus;
  return status === 'active' || status === 'trialing';
}

export async function getPublishedCourses() {
  return db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      description: courses.description,
      isPublished: courses.isPublished,
    })
    .from(courses)
    .where(eq(courses.isPublished, true))
    .orderBy(asc(courses.id));
}

export async function getCourseBySlug(slug: string) {
  const rows = await db
    .select()
    .from(courses)
    .where(and(eq(courses.slug, slug), eq(courses.isPublished, true)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getCourseOutline(courseId: number) {
  return db.query.courseModules.findMany({
    where: eq(courseModules.courseId, courseId),
    orderBy: (m, { asc }) => [asc(m.sortOrder)],
    with: {
      lessons: {
        orderBy: (l, { asc }) => [asc(l.sortOrder)],
      },
    },
  });
}

export async function getLessonByCourseSlugAndKey(
  courseSlug: string,
  lessonKey: string
) {
  const course = await getCourseBySlug(courseSlug);
  if (!course) return null;

  const rows = await db
    .select({
      lesson: lessons,
      module: courseModules,
    })
    .from(lessons)
    .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
    .where(
      and(
        eq(courseModules.courseId, course.id),
        eq(lessons.lessonKey, lessonKey)
      )
    )
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return { course, lesson: row.lesson, module: row.module };
}

export async function getCompletedLessonIdsForUser(
  userId: number,
  lessonIds: number[]
) {
  if (lessonIds.length === 0) return new Set<number>();
  const rows = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        inArray(lessonProgress.lessonId, lessonIds),
        isNotNull(lessonProgress.completedAt)
      )
    );
  return new Set(rows.map((r) => r.lessonId));
}

export async function setLessonCompleted(args: {
  userId: number;
  lessonId: number;
  completed: boolean;
}) {
  const now = new Date();
  if (!args.completed) {
    await db
      .delete(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, args.userId),
          eq(lessonProgress.lessonId, args.lessonId)
        )
      );
    return;
  }

  const existing = await db
    .select({ id: lessonProgress.id })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, args.userId),
        eq(lessonProgress.lessonId, args.lessonId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(lessonProgress)
      .set({ completedAt: now, updatedAt: now })
      .where(eq(lessonProgress.id, existing[0].id));
  } else {
    await db.insert(lessonProgress).values({
      userId: args.userId,
      lessonId: args.lessonId,
      completedAt: now,
      updatedAt: now,
    });
  }
}
