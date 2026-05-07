import { eq } from 'drizzle-orm';
import { db } from './drizzle';
import { courseModules, courses, lessons } from './schema';
import {
  COMING_SOON_CATALOG,
  CURRICULUM,
  GLOW_FLOW_CARD_DESCRIPTION,
  GLOW_FLOW_COURSE_SLUG,
} from '@/lib/courses/curriculum';

export async function seedComingSoonCourses() {
  for (const row of COMING_SOON_CATALOG) {
    const existing = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.slug, row.slug))
      .limit(1);

    if (existing.length > 0) {
      console.log(`Course "${row.slug}" already exists, skipping coming-soon seed.`);
      continue;
    }

    await db.insert(courses).values({
      slug: row.slug,
      title: row.title,
      description: row.description,
      isPublished: true,
      isComingSoon: true,
      previewModuleCount: row.previewModuleCount,
      previewLessonCount: row.previewLessonCount,
      previewEstMinutes: row.previewEstMinutes,
      heroImagePath: row.heroImagePath?.trim() ?? null,
    });
    console.log(`Seeded coming-soon course: ${row.slug}`);
  }
}

export async function seedGlowFlowCourse() {
  const existingSlug = await db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.slug, GLOW_FLOW_COURSE_SLUG))
    .limit(1);

  if (existingSlug.length > 0) {
    console.log('Glow Flow course already seeded, skipping.');
    return;
  }

  const [course] = await db
    .insert(courses)
    .values({
      slug: GLOW_FLOW_COURSE_SLUG,
      title: 'Glow Flow Method',
      description: GLOW_FLOW_CARD_DESCRIPTION,
      isPublished: true,
    })
    .returning();

  let moduleOrder = 0;
  for (const mod of CURRICULUM) {
    const [cm] = await db
      .insert(courseModules)
      .values({
        courseId: course.id,
        slug: mod.id,
        sortOrder: moduleOrder++,
        titleEs: mod.titleEs,
        titleEn: mod.titleEn,
        descriptionEs: mod.descEs,
        descriptionEn: mod.descEn,
        legacyFolder: mod.id.replace(/\/$/, ''),
      })
      .returning();

    let lessonOrder = 0;
    for (const les of mod.lessons) {
      await db.insert(lessons).values({
        moduleId: cm.id,
        lessonKey: les.id,
        sortOrder: lessonOrder++,
        titleEs: les.titleEs,
        titleEn: les.titleEn,
        legacyHtmlPath: les.path,
      });
    }
  }

  console.log('Glow Flow course tree seeded.');
}
