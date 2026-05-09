'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import {
  courseModules,
  courses,
  lessonVersions,
  lessons,
  type CourseLifecycleStatus,
  type Lesson,
} from '@/lib/db/schema';
import { lessonRowToSnapshot } from '@/lib/admin/lesson-version-snapshot';
import { requireCourseStaff } from '@/lib/admin/require-staff';
import { slugifyTitle } from '@/lib/admin/slug';
import {
  getAdminCourseBySlug,
  getAdminModuleBySlug,
} from '@/lib/db/queries-admin';
import { revalidateCourseStudio } from '@/lib/admin/revalidate-studio';
import {
  lessonBlocksHaveContent,
  parseLessonBlocksJson,
} from '@/lib/courses/blocknote-content';

const lifecycleSchema = z.enum([
  'draft',
  'review',
  'scheduled',
  'published',
  'archived',
]);

async function uniqueCourseSlug(base: string): Promise<string> {
  let candidate = base.slice(0, 120);
  let n = 2;
  for (;;) {
    const existing = await db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.slug, candidate), isNull(courses.deletedAt)))
      .limit(1);
    if (existing.length === 0) return candidate;
    const suffix = `-${n++}`;
    candidate = `${base.slice(0, 120 - suffix.length)}${suffix}`;
  }
}

export async function createCourseAction(formData: FormData) {
  await requireCourseStaff();

  const raw = {
    title: formData.get('title'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    primaryLocale: formData.get('primaryLocale'),
    accessMode: formData.get('accessMode'),
  };

  const schema = z.object({
    title: z.string().min(1).max(255),
    slug: z.string().max(120).optional().nullable(),
    description: z.string().max(20000).optional().nullable(),
    primaryLocale: z.enum(['en', 'es']).default('en'),
    accessMode: z.enum(['subscription', 'free']).default('subscription'),
  });

  const parsed = schema.safeParse({
    title: raw.title,
    slug: raw.slug || undefined,
    description: raw.description || undefined,
    primaryLocale: raw.primaryLocale || 'en',
    accessMode: raw.accessMode || 'subscription',
  });

  if (!parsed.success) {
    redirect('/admin/courses/new?error=invalid');
  }

  const baseSlug = parsed.data.slug?.trim()
    ? slugifyTitle(parsed.data.slug)
    : slugifyTitle(parsed.data.title);
  const slug = await uniqueCourseSlug(baseSlug);

  await db.insert(courses).values({
    slug,
    title: parsed.data.title.trim(),
    description: parsed.data.description?.trim() || null,
    lifecycleStatus: 'draft',
    primaryLocale: parsed.data.primaryLocale,
    accessMode: parsed.data.accessMode,
  });

  revalidatePath('/admin/courses');
  redirect(`/admin/courses/${slug}/studio`);
}

export async function updateCourseAction(formData: FormData) {
  await requireCourseStaff();

  const schema = z.object({
    courseSlug: z.string().min(1),
    title: z.string().min(1).max(255),
    description: z.string().max(20000).optional().nullable(),
    primaryLocale: z.enum(['en', 'es']),
    accessMode: z.enum(['subscription', 'free']),
    previewModuleCount: z.coerce.number().int().min(0).optional().nullable(),
    previewLessonCount: z.coerce.number().int().min(0).optional().nullable(),
    previewEstMinutes: z.coerce.number().int().min(0).optional().nullable(),
  });

  const parsed = schema.safeParse({
    courseSlug: formData.get('courseSlug'),
    title: formData.get('title'),
    description: formData.get('description'),
    primaryLocale: formData.get('primaryLocale'),
    accessMode: formData.get('accessMode'),
    previewModuleCount: formData.get('previewModuleCount'),
    previewLessonCount: formData.get('previewLessonCount'),
    previewEstMinutes: formData.get('previewEstMinutes'),
  });

  if (!parsed.success) return;

  const course = await getAdminCourseBySlug(parsed.data.courseSlug);
  if (!course) return;

  await db
    .update(courses)
    .set({
      title: parsed.data.title.trim(),
      description: parsed.data.description?.trim() || null,
      primaryLocale: parsed.data.primaryLocale,
      accessMode: parsed.data.accessMode,
      previewModuleCount: parsed.data.previewModuleCount ?? null,
      previewLessonCount: parsed.data.previewLessonCount ?? null,
      previewEstMinutes: parsed.data.previewEstMinutes ?? null,
      updatedAt: new Date(),
    })
    .where(eq(courses.id, course.id));

  revalidatePath('/admin/courses');
  revalidateCourseStudio(parsed.data.courseSlug);
  revalidatePath('/dashboard/courses', 'layout');
}

/** Sets only `hero_image_path` so saving other course fields never clears the cover. */
export async function updateCourseHeroImageAction(formData: FormData) {
  await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      heroImagePath: z.string().max(512).optional().nullable(),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      heroImagePath: formData.get('heroImagePath'),
    });

  if (!parsed.success) return { ok: false as const, error: 'invalid' as const };

  const course = await getAdminCourseBySlug(parsed.data.courseSlug);
  if (!course) return { ok: false as const, error: 'not_found' as const };

  const next = parsed.data.heroImagePath?.trim() || null;

  await db
    .update(courses)
    .set({
      heroImagePath: next,
      updatedAt: new Date(),
    })
    .where(eq(courses.id, course.id));

  revalidatePath('/admin/courses');
  revalidateCourseStudio(parsed.data.courseSlug);
  revalidatePath('/dashboard/courses', 'layout');
  return { ok: true as const };
}

export async function setCourseLifecycleAction(formData: FormData) {
  await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      lifecycleStatus: lifecycleSchema,
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      lifecycleStatus: formData.get('lifecycleStatus'),
    });

  if (!parsed.success) return;

  const course = await getAdminCourseBySlug(parsed.data.courseSlug);
  if (!course) return;

  await db
    .update(courses)
    .set({
      lifecycleStatus: parsed.data.lifecycleStatus as CourseLifecycleStatus,
      updatedAt: new Date(),
    })
    .where(eq(courses.id, course.id));

  revalidatePath('/admin/courses');
  revalidateCourseStudio(parsed.data.courseSlug);
  revalidatePath('/dashboard/courses', 'layout');
}

export async function softDeleteCourseAction(formData: FormData) {
  await requireCourseStaff();

  const parsed = z
    .object({ courseSlug: z.string().min(1) })
    .safeParse({ courseSlug: formData.get('courseSlug') });
  if (!parsed.success) return;

  const course = await getAdminCourseBySlug(parsed.data.courseSlug);
  if (!course) return;

  await db
    .update(courses)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(courses.id, course.id));

  revalidatePath('/admin/courses');
  revalidatePath('/dashboard/courses', 'layout');
  redirect('/admin/courses');
}

export async function createModuleAction(formData: FormData) {
  await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      titleEn: z.string().min(1).max(255),
      titleEs: z.string().min(1).max(255),
      slug: z.string().max(120).optional().nullable(),
      descriptionEn: z.string().max(5000).optional().nullable(),
      descriptionEs: z.string().max(5000).optional().nullable(),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      titleEn: formData.get('titleEn'),
      titleEs: formData.get('titleEs'),
      slug: formData.get('slug'),
      descriptionEn: formData.get('descriptionEn'),
      descriptionEs: formData.get('descriptionEs'),
    });

  if (!parsed.success) return;

  const course = await getAdminCourseBySlug(parsed.data.courseSlug);
  if (!course) return;

  const modSlugBase = parsed.data.slug?.trim()
    ? slugifyTitle(parsed.data.slug)
    : slugifyTitle(parsed.data.titleEn);

  let moduleSlug = modSlugBase;
  let n = 2;
  for (;;) {
    const clash = await db
      .select({ id: courseModules.id })
      .from(courseModules)
      .where(
        and(
          eq(courseModules.courseId, course.id),
          eq(courseModules.slug, moduleSlug),
          isNull(courseModules.deletedAt)
        )
      )
      .limit(1);
    if (clash.length === 0) break;
    moduleSlug = `${modSlugBase}-${n++}`;
  }

  const [maxRow] = await db
    .select({ max: sql<number>`max(${courseModules.sortOrder})` })
    .from(courseModules)
    .where(
      and(
        eq(courseModules.courseId, course.id),
        isNull(courseModules.deletedAt)
      )
    );
  const nextOrder = (maxRow?.max ?? -1) + 1;

  await db.insert(courseModules).values({
    courseId: course.id,
    slug: moduleSlug,
    sortOrder: nextOrder,
    titleEn: parsed.data.titleEn.trim(),
    titleEs: parsed.data.titleEs.trim(),
    descriptionEn: parsed.data.descriptionEn?.trim() || null,
    descriptionEs: parsed.data.descriptionEs?.trim() || null,
  });

  revalidateCourseStudio(parsed.data.courseSlug);
}

export async function updateModuleAction(formData: FormData) {
  await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      moduleSlug: z.string().min(1),
      titleEn: z.string().min(1).max(255),
      titleEs: z.string().min(1).max(255),
      descriptionEn: z.string().max(5000).optional().nullable(),
      descriptionEs: z.string().max(5000).optional().nullable(),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      moduleSlug: formData.get('moduleSlug'),
      titleEn: formData.get('titleEn'),
      titleEs: formData.get('titleEs'),
      descriptionEn: formData.get('descriptionEn'),
      descriptionEs: formData.get('descriptionEs'),
    });

  if (!parsed.success) return;

  const course = await getAdminCourseBySlug(parsed.data.courseSlug);
  if (!course) return;

  const mod = await getAdminModuleBySlug(course.id, parsed.data.moduleSlug);
  if (!mod) return;

  await db
    .update(courseModules)
    .set({
      titleEn: parsed.data.titleEn.trim(),
      titleEs: parsed.data.titleEs.trim(),
      descriptionEn: parsed.data.descriptionEn?.trim() || null,
      descriptionEs: parsed.data.descriptionEs?.trim() || null,
    })
    .where(eq(courseModules.id, mod.id));

  revalidateCourseStudio(parsed.data.courseSlug);
}

export async function reorderModulesAction(formData: FormData) {
  await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      orderedIds: z.string().min(1),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      orderedIds: formData.get('orderedIds'),
    });

  if (!parsed.success) return;

  const ids = parsed.data.orderedIds
    .split(',')
    .map((x) => Number(x.trim()))
    .filter((x) => Number.isFinite(x));
  if (ids.length === 0) return;

  const course = await getAdminCourseBySlug(parsed.data.courseSlug);
  if (!course) return;

  await db.transaction(async (tx) => {
    for (let i = 0; i < ids.length; i++) {
      await tx
        .update(courseModules)
        .set({ sortOrder: -1000 - i })
        .where(
          and(
            eq(courseModules.id, ids[i]!),
            eq(courseModules.courseId, course.id)
          )
        );
    }
    for (let i = 0; i < ids.length; i++) {
      await tx
        .update(courseModules)
        .set({ sortOrder: i })
        .where(
          and(
            eq(courseModules.id, ids[i]!),
            eq(courseModules.courseId, course.id)
          )
        );
    }
  });

  revalidateCourseStudio(parsed.data.courseSlug);
}

export async function softDeleteModuleAction(formData: FormData) {
  await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      moduleSlug: z.string().min(1),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      moduleSlug: formData.get('moduleSlug'),
    });

  if (!parsed.success) return;

  const course = await getAdminCourseBySlug(parsed.data.courseSlug);
  if (!course) return;

  const mod = await getAdminModuleBySlug(course.id, parsed.data.moduleSlug);
  if (!mod) return;

  await db
    .update(courseModules)
    .set({ deletedAt: new Date() })
    .where(eq(courseModules.id, mod.id));

  revalidateCourseStudio(parsed.data.courseSlug);
}

export async function createLessonAction(formData: FormData) {
  await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      moduleSlug: z.string().min(1),
      lessonKey: z.string().min(1).max(120),
      titleEn: z.string().min(1).max(255),
      titleEs: z.string().min(1).max(255),
      legacyHtmlPath: z.string().max(512).optional().nullable(),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      moduleSlug: formData.get('moduleSlug'),
      lessonKey: formData.get('lessonKey'),
      titleEn: formData.get('titleEn'),
      titleEs: formData.get('titleEs'),
      legacyHtmlPath: formData.get('legacyHtmlPath'),
    });

  if (!parsed.success) return;

  const course = await getAdminCourseBySlug(parsed.data.courseSlug);
  if (!course) return;

  const mod = await getAdminModuleBySlug(course.id, parsed.data.moduleSlug);
  if (!mod) return;

  const baseKey = slugifyTitle(parsed.data.lessonKey).slice(0, 120);
  let lessonKey = baseKey;
  let n = 2;
  for (;;) {
    const clash = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(
        and(eq(lessons.moduleId, mod.id), eq(lessons.lessonKey, lessonKey))
      )
      .limit(1);
    if (clash.length === 0) break;
    const suffix = `-${n++}`;
    lessonKey = `${baseKey.slice(0, 120 - suffix.length)}${suffix}`;
  }

  const [maxRow] = await db
    .select({ max: sql<number>`max(${lessons.sortOrder})` })
    .from(lessons)
    .where(and(eq(lessons.moduleId, mod.id), isNull(lessons.deletedAt)));
  const nextOrder = (maxRow?.max ?? -1) + 1;

  await db.insert(lessons).values({
    moduleId: mod.id,
    lessonKey,
    sortOrder: nextOrder,
    titleEn: parsed.data.titleEn.trim(),
    titleEs: parsed.data.titleEs.trim(),
    legacyHtmlPath: parsed.data.legacyHtmlPath?.trim() || null,
    draftBodyMarkdown: null,
    publishedBodyMarkdown: null,
  });

  revalidateCourseStudio(parsed.data.courseSlug);
  revalidatePath('/dashboard/courses', 'layout');
}

export async function updateLessonMetaAction(formData: FormData) {
  await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      lessonKey: z.string().min(1),
      titleEn: z.string().min(1).max(255),
      titleEs: z.string().min(1).max(255),
      legacyHtmlPath: z.string().max(512).optional().nullable(),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      lessonKey: formData.get('lessonKey'),
      titleEn: formData.get('titleEn'),
      titleEs: formData.get('titleEs'),
      legacyHtmlPath: formData.get('legacyHtmlPath'),
    });

  if (!parsed.success) return;

  const course = await getAdminCourseBySlug(parsed.data.courseSlug);
  if (!course) return;

  const row = await db
    .select({ lesson: lessons })
    .from(lessons)
    .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
    .where(
      and(
        eq(courseModules.courseId, course.id),
        eq(lessons.lessonKey, parsed.data.lessonKey),
        isNull(lessons.deletedAt),
        isNull(courseModules.deletedAt)
      )
    )
    .limit(1);

  const bundle = row[0];
  if (!bundle) return;

  await db
    .update(lessons)
    .set({
      titleEn: parsed.data.titleEn.trim(),
      titleEs: parsed.data.titleEs.trim(),
      legacyHtmlPath: parsed.data.legacyHtmlPath?.trim() || null,
    })
    .where(eq(lessons.id, bundle.lesson.id));

  revalidateCourseStudio(parsed.data.courseSlug);
  revalidatePath('/dashboard/courses', 'layout');
}

export async function saveLessonDraftAction(formData: FormData) {
  await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      lessonKey: z.string().min(1),
      draftBodyMarkdown: z.string().max(500_000).optional().nullable(),
      draftBodyBlocksJson: z.string().max(1_500_000).optional().nullable(),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      lessonKey: formData.get('lessonKey'),
      draftBodyMarkdown: formData.get('draftBodyMarkdown'),
      draftBodyBlocksJson: formData.get('draftBodyBlocksJson'),
    });

  if (!parsed.success) return;

  const course = await getAdminCourseBySlug(parsed.data.courseSlug);
  if (!course) return;

  const row = await db
    .select({ lesson: lessons })
    .from(lessons)
    .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
    .where(
      and(
        eq(courseModules.courseId, course.id),
        eq(lessons.lessonKey, parsed.data.lessonKey),
        isNull(lessons.deletedAt),
        isNull(courseModules.deletedAt)
      )
    )
    .limit(1);

  const bundle = row[0];
  if (!bundle) return;
  const draftBlocks = parseLessonBlocksJson(parsed.data.draftBodyBlocksJson);
  if (parsed.data.draftBodyBlocksJson != null && draftBlocks === undefined) {
    return;
  }

  await db
    .update(lessons)
    .set({
      draftBodyMarkdown: parsed.data.draftBodyMarkdown ?? null,
      ...(draftBlocks !== undefined ? { draftBodyBlocks: draftBlocks } : {}),
    })
    .where(eq(lessons.id, bundle.lesson.id));

  revalidateCourseStudio(parsed.data.courseSlug);
}

/** Same write as saveLessonDraftAction; skips revalidatePath for high-frequency autosave. */
export async function autosaveLessonDraftAction(
  formData: FormData
): Promise<
  { ok: true; savedAt: string } | { ok: false; error: 'invalid' | 'not_found' }
> {
  await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      lessonKey: z.string().min(1),
      draftBodyMarkdown: z.string().max(500_000).optional().nullable(),
      draftBodyBlocksJson: z.string().max(1_500_000).optional().nullable(),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      lessonKey: formData.get('lessonKey'),
      draftBodyMarkdown: formData.get('draftBodyMarkdown'),
      draftBodyBlocksJson: formData.get('draftBodyBlocksJson'),
    });

  if (!parsed.success) return { ok: false, error: 'invalid' };

  const course = await getAdminCourseBySlug(parsed.data.courseSlug);
  if (!course) return { ok: false, error: 'not_found' };

  const row = await db
    .select({ lesson: lessons })
    .from(lessons)
    .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
    .where(
      and(
        eq(courseModules.courseId, course.id),
        eq(lessons.lessonKey, parsed.data.lessonKey),
        isNull(lessons.deletedAt),
        isNull(courseModules.deletedAt)
      )
    )
    .limit(1);

  const bundle = row[0];
  if (!bundle) return { ok: false, error: 'not_found' };
  const draftBlocks = parseLessonBlocksJson(parsed.data.draftBodyBlocksJson);
  if (parsed.data.draftBodyBlocksJson != null && draftBlocks === undefined) {
    return { ok: false, error: 'invalid' };
  }

  await db
    .update(lessons)
    .set({
      draftBodyMarkdown: parsed.data.draftBodyMarkdown ?? null,
      ...(draftBlocks !== undefined ? { draftBodyBlocks: draftBlocks } : {}),
    })
    .where(eq(lessons.id, bundle.lesson.id));

  return { ok: true, savedAt: new Date().toISOString() };
}

export async function publishLessonBodyAction(
  formData: FormData
): Promise<
  | { ok: true }
  | {
      ok: false;
      error: 'invalid' | 'not_found' | 'nothing_to_publish';
    }
> {
  const user = await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      lessonKey: z.string().min(1),
      draftBodyMarkdown: z.string().max(500_000).optional().nullable(),
      draftBodyBlocksJson: z.string().max(1_500_000).optional().nullable(),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      lessonKey: formData.get('lessonKey'),
      draftBodyMarkdown: formData.get('draftBodyMarkdown'),
      draftBodyBlocksJson: formData.get('draftBodyBlocksJson'),
    });

  if (!parsed.success) return { ok: false, error: 'invalid' };

  const course = await getAdminCourseBySlug(parsed.data.courseSlug);
  if (!course) return { ok: false, error: 'not_found' };

  const row = await db
    .select({ lesson: lessons })
    .from(lessons)
    .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
    .where(
      and(
        eq(courseModules.courseId, course.id),
        eq(lessons.lessonKey, parsed.data.lessonKey),
        isNull(lessons.deletedAt),
        isNull(courseModules.deletedAt)
      )
    )
    .limit(1);

  const bundle = row[0];
  if (!bundle) return { ok: false, error: 'not_found' };
  const blocksFromForm = parseLessonBlocksJson(parsed.data.draftBodyBlocksJson);
  if (parsed.data.draftBodyBlocksJson != null && blocksFromForm === undefined) {
    return { ok: false, error: 'invalid' };
  }

  const fromForm = parsed.data.draftBodyMarkdown;
  const draftFromDb = bundle.lesson.draftBodyMarkdown?.trim() ?? '';
  const draft =
    fromForm !== undefined && fromForm !== null
      ? fromForm.trim()
      : draftFromDb;
  const candidateBlocks =
    blocksFromForm !== undefined ? blocksFromForm : bundle.lesson.draftBodyBlocks;
  const nextPublishedBlocks = lessonBlocksHaveContent(candidateBlocks)
    ? candidateBlocks
    : null;
  const nextPublished =
    draft !== ''
      ? draft
      : bundle.lesson.publishedBodyMarkdown?.trim() ?? '';
  const hasStudent =
    lessonBlocksHaveContent(nextPublishedBlocks) ||
    nextPublished !== '' ||
    Boolean(bundle.lesson.legacyHtmlPath?.trim());
  if (!hasStudent) {
    return { ok: false, error: 'nothing_to_publish' };
  }

  const prePublishLesson: Lesson = {
    ...bundle.lesson,
    draftBodyMarkdown:
      fromForm !== undefined && fromForm !== null
        ? fromForm || null
        : bundle.lesson.draftBodyMarkdown,
    draftBodyBlocks:
      blocksFromForm !== undefined
        ? blocksFromForm
        : bundle.lesson.draftBodyBlocks,
  };

  await db.insert(lessonVersions).values({
    lessonId: bundle.lesson.id,
    snapshot: lessonRowToSnapshot(prePublishLesson),
    createdByUserId: user.id,
    versionNote: 'Auto-snapshot before publish',
  });

  const now = new Date();
  await db
    .update(lessons)
    .set({
      draftBodyMarkdown:
        fromForm !== undefined && fromForm !== null
          ? fromForm || null
          : bundle.lesson.draftBodyMarkdown,
      ...(blocksFromForm !== undefined ? { draftBodyBlocks: blocksFromForm } : {}),
      publishedBodyBlocks: nextPublishedBlocks,
      publishedBodyMarkdown:
        draft !== ''
          ? draft
          : bundle.lesson.publishedBodyMarkdown,
      lessonPublishedAt: now,
    })
    .where(eq(lessons.id, bundle.lesson.id));

  revalidateCourseStudio(parsed.data.courseSlug);
  revalidatePath('/dashboard/courses', 'layout');
  return { ok: true };
}

export async function reorderLessonsAction(formData: FormData) {
  await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      moduleSlug: z.string().min(1),
      orderedIds: z.string().min(1),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      moduleSlug: formData.get('moduleSlug'),
      orderedIds: formData.get('orderedIds'),
    });

  if (!parsed.success) return;

  const ids = parsed.data.orderedIds
    .split(',')
    .map((x) => Number(x.trim()))
    .filter((x) => Number.isFinite(x));
  if (ids.length === 0) return;

  const course = await getAdminCourseBySlug(parsed.data.courseSlug);
  if (!course) return;

  const mod = await getAdminModuleBySlug(course.id, parsed.data.moduleSlug);
  if (!mod) return;

  await db.transaction(async (tx) => {
    for (let i = 0; i < ids.length; i++) {
      await tx
        .update(lessons)
        .set({ sortOrder: -1000 - i })
        .where(
          and(eq(lessons.id, ids[i]!), eq(lessons.moduleId, mod.id))
        );
    }
    for (let i = 0; i < ids.length; i++) {
      await tx
        .update(lessons)
        .set({ sortOrder: i })
        .where(
          and(eq(lessons.id, ids[i]!), eq(lessons.moduleId, mod.id))
        );
    }
  });

  revalidateCourseStudio(parsed.data.courseSlug);
}

export async function softDeleteLessonAction(formData: FormData) {
  await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      lessonKey: z.string().min(1),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      lessonKey: formData.get('lessonKey'),
    });

  if (!parsed.success) return;

  const course = await getAdminCourseBySlug(parsed.data.courseSlug);
  if (!course) return;

  const row = await db
    .select({ lesson: lessons, module: courseModules })
    .from(lessons)
    .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
    .where(
      and(
        eq(courseModules.courseId, course.id),
        eq(lessons.lessonKey, parsed.data.lessonKey),
        isNull(lessons.deletedAt),
        isNull(courseModules.deletedAt)
      )
    )
    .limit(1);

  const bundle = row[0];
  if (!bundle) return;

  await db
    .update(lessons)
    .set({ deletedAt: new Date() })
    .where(eq(lessons.id, bundle.lesson.id));

  revalidateCourseStudio(parsed.data.courseSlug);
  revalidatePath('/dashboard/courses', 'layout');
}
