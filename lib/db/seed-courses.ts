import { eq } from 'drizzle-orm';
import { db } from './drizzle';
import { courseModules, courses, lessons } from './schema';
import {
  CURRICULUM,
  GLOW_FLOW_COURSE_SLUG,
} from '@/lib/courses/curriculum';

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
      description:
        'Premium course on structure, discipline, identity, focus, and sustainable systems. Lessons load from the legacy HTML viewer until migrated to native content.',
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
