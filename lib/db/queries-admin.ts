import 'server-only';

import { and, asc, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { listLessonPlacementsForCourse } from './queries-media';
import { courseModules, courses, lessons } from './schema';

/** All non-deleted courses for CMS list */
export async function listCoursesForAdmin() {
  return db
    .select()
    .from(courses)
    .where(isNull(courses.deletedAt))
    .orderBy(asc(courses.id));
}

export async function getAdminCourseBySlug(slug: string) {
  const rows = await db
    .select()
    .from(courses)
    .where(and(eq(courses.slug, slug), isNull(courses.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}

/** Modules + lessons for editors (includes lessons without published body). */
export async function getCourseOutlineForAdmin(courseId: number) {
  const rows = await db.query.courseModules.findMany({
    where: and(
      eq(courseModules.courseId, courseId),
      isNull(courseModules.deletedAt)
    ),
    orderBy: (m, { asc: a }) => [a(m.sortOrder)],
    with: {
      lessons: {
        orderBy: (l, { asc: a }) => [a(l.sortOrder)],
      },
    },
  });
  return rows.map((m) => ({
    ...m,
    lessons: m.lessons.filter((l) => l.deletedAt == null),
  }));
}

export async function getLessonByCourseSlugAndKeyForAdmin(
  courseSlug: string,
  lessonKey: string
) {
  const course = await getAdminCourseBySlug(courseSlug);
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
        eq(lessons.lessonKey, lessonKey),
        isNull(lessons.deletedAt),
        isNull(courseModules.deletedAt)
      )
    )
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return { course, lesson: row.lesson, module: row.module };
}

export async function getAdminModuleBySlug(courseId: number, moduleSlug: string) {
  const rows = await db
    .select()
    .from(courseModules)
    .where(
      and(
        eq(courseModules.courseId, courseId),
        eq(courseModules.slug, moduleSlug),
        isNull(courseModules.deletedAt)
      )
    )
    .limit(1);
  return rows[0] ?? null;
}

export type AdminCourseStudioPayload = {
  course: NonNullable<Awaited<ReturnType<typeof getAdminCourseBySlug>>>;
  outline: Awaited<ReturnType<typeof getCourseOutlineForAdmin>>;
  placementsByLesson: Awaited<ReturnType<typeof listLessonPlacementsForCourse>>;
};

/** Full course tree + ordered lesson placements for Course Studio (staff routes only). */
export async function getAdminCourseStudioPayload(
  slug: string
): Promise<AdminCourseStudioPayload | null> {
  const course = await getAdminCourseBySlug(slug);
  if (!course) return null;
  const outline = await getCourseOutlineForAdmin(course.id);
  const placementsByLesson = await listLessonPlacementsForCourse(course.id);
  return { course, outline, placementsByLesson };
}
