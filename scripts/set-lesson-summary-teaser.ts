/**
 * One-off / ops: set summary_en for a lesson (scoped by course slug + lesson key).
 * Usage: npx tsx scripts/set-lesson-summary-teaser.ts
 */
import 'dotenv/config';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { courseModules, courses, lessons } from '@/lib/db/schema';

const COURSE_SLUG = 'glow-flow-method';
const LESSON_KEY = 'mod1-l01';
/** Short sidebar teaser — avoid duplicating full flowKeyInsight body copy. */
const SUMMARY_EN =
  'Motivation helps you start; structure is what sustains change when mood swings.';

async function main() {
  const rows = await db
    .select({ lessonId: lessons.id })
    .from(lessons)
    .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
    .innerJoin(courses, eq(courseModules.courseId, courses.id))
    .where(
      and(eq(courses.slug, COURSE_SLUG), eq(lessons.lessonKey, LESSON_KEY))
    )
    .limit(1);

  const id = rows[0]?.lessonId;
  if (!id) {
    console.error(`No lesson ${LESSON_KEY} in course ${COURSE_SLUG}`);
    process.exit(1);
  }

  await db.update(lessons).set({ summaryEn: SUMMARY_EN }).where(eq(lessons.id, id));

  console.log(`Updated lessons.id=${id} summary_en (${SUMMARY_EN.length} chars)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
