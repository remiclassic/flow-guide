'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { parseVideoEmbedUrl } from '@/lib/courses/embed-url';
import {
  mergeLessonAssetMetadata,
  type LessonAssetUiMetadata,
} from '@/lib/courses/lesson-asset-metadata';
import { db } from '@/lib/db/drizzle';
import {
  getAdminCourseBySlug,
  getAdminModuleBySlug,
  getCourseOutlineForAdmin,
  getLessonByCourseSlugAndKeyForAdmin,
} from '@/lib/db/queries-admin';
import {
  listLessonPlacementsOrdered,
} from '@/lib/db/queries-media';
import { courseModules, lessonAssets, lessons } from '@/lib/db/schema';
import { slugifyTitle } from '@/lib/admin/slug';
import { requireCourseStaff } from '@/lib/admin/require-staff';
import { revalidateCourseStudio } from '@/lib/admin/revalidate-studio';
import { knowledgeQuizDataSchema } from '@/lib/courses/knowledge-quiz';

export async function updateLessonStudioFieldsAction(formData: FormData) {
  await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      lessonKey: z.string().min(1),
      titleEn: z.string().min(1).max(255),
      titleEs: z.string().min(1).max(255),
      summaryEn: z.string().max(20000).optional().nullable(),
      summaryEs: z.string().max(20000).optional().nullable(),
      reflectionPromptEn: z.string().max(20000).optional().nullable(),
      reflectionPromptEs: z.string().max(20000).optional().nullable(),
      actionStepsEn: z.string().max(50000).optional().nullable(),
      actionStepsEs: z.string().max(50000).optional().nullable(),
      estimatedMinutes: z.coerce.number().int().min(0).max(24 * 60).optional().nullable(),
      legacyHtmlPath: z.string().max(512).optional().nullable(),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      lessonKey: formData.get('lessonKey'),
      titleEn: formData.get('titleEn'),
      titleEs: formData.get('titleEs'),
      summaryEn: formData.get('summaryEn'),
      summaryEs: formData.get('summaryEs'),
      reflectionPromptEn: formData.get('reflectionPromptEn'),
      reflectionPromptEs: formData.get('reflectionPromptEs'),
      actionStepsEn: formData.get('actionStepsEn'),
      actionStepsEs: formData.get('actionStepsEs'),
      estimatedMinutes: formData.get('estimatedMinutes'),
      legacyHtmlPath: formData.get('legacyHtmlPath'),
    });

  if (!parsed.success) return { ok: false as const, error: 'invalid' as const };

  const course = await getAdminCourseBySlug(parsed.data.courseSlug);
  if (!course) return { ok: false as const, error: 'not_found' as const };

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
  if (!bundle) return { ok: false as const, error: 'not_found' as const };

  const est = parsed.data.estimatedMinutes;

  let nextKnowledgeQuiz = bundle.lesson.knowledgeQuizJson;
  const quizField = formData.get('knowledgeQuizJson');
  if (quizField === null) {
    nextKnowledgeQuiz = bundle.lesson.knowledgeQuizJson;
  } else if (typeof quizField !== 'string' || !quizField.trim()) {
    nextKnowledgeQuiz = null;
  } else {
    try {
      const raw = JSON.parse(quizField) as unknown;
      const r = knowledgeQuizDataSchema.safeParse(raw);
      if (!r.success) {
        nextKnowledgeQuiz = bundle.lesson.knowledgeQuizJson;
      } else if (r.data.items.length === 0) {
        nextKnowledgeQuiz = null;
      } else {
        nextKnowledgeQuiz = r.data;
      }
    } catch {
      nextKnowledgeQuiz = bundle.lesson.knowledgeQuizJson;
    }
  }

  await db
    .update(lessons)
    .set({
      titleEn: parsed.data.titleEn.trim(),
      titleEs: parsed.data.titleEs.trim(),
      summaryEn: parsed.data.summaryEn?.trim() || null,
      summaryEs: parsed.data.summaryEs?.trim() || null,
      reflectionPromptEn: parsed.data.reflectionPromptEn?.trim() || null,
      reflectionPromptEs: parsed.data.reflectionPromptEs?.trim() || null,
      actionStepsEn: parsed.data.actionStepsEn?.trim() || null,
      actionStepsEs: parsed.data.actionStepsEs?.trim() || null,
      estimatedMinutes: est != null && est > 0 ? est : null,
      legacyHtmlPath: parsed.data.legacyHtmlPath?.trim() || null,
      knowledgeQuizJson: nextKnowledgeQuiz,
    })
    .where(eq(lessons.id, bundle.lesson.id));

  revalidateCourseStudio(parsed.data.courseSlug);
  revalidatePath('/dashboard/courses', 'layout');
  return { ok: true as const };
}

/** Debounced studio autosave: same validation as `updateLessonStudioFieldsAction` without revalidate storms. */
export async function autosaveLessonStudioFieldsAction(
  formData: FormData
): Promise<
  { ok: true; savedAt: string } | { ok: false; error: 'invalid' | 'not_found' }
> {
  await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      lessonKey: z.string().min(1),
      titleEn: z.string().min(1).max(255),
      titleEs: z.string().min(1).max(255),
      summaryEn: z.string().max(20000).optional().nullable(),
      summaryEs: z.string().max(20000).optional().nullable(),
      reflectionPromptEn: z.string().max(20000).optional().nullable(),
      reflectionPromptEs: z.string().max(20000).optional().nullable(),
      actionStepsEn: z.string().max(50000).optional().nullable(),
      actionStepsEs: z.string().max(50000).optional().nullable(),
      estimatedMinutes: z.coerce.number().int().min(0).max(24 * 60).optional().nullable(),
      legacyHtmlPath: z.string().max(512).optional().nullable(),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      lessonKey: formData.get('lessonKey'),
      titleEn: formData.get('titleEn'),
      titleEs: formData.get('titleEs'),
      summaryEn: formData.get('summaryEn'),
      summaryEs: formData.get('summaryEs'),
      reflectionPromptEn: formData.get('reflectionPromptEn'),
      reflectionPromptEs: formData.get('reflectionPromptEs'),
      actionStepsEn: formData.get('actionStepsEn'),
      actionStepsEs: formData.get('actionStepsEs'),
      estimatedMinutes: formData.get('estimatedMinutes'),
      legacyHtmlPath: formData.get('legacyHtmlPath'),
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

  const est = parsed.data.estimatedMinutes;

  let nextKnowledgeQuiz = bundle.lesson.knowledgeQuizJson;
  const quizField = formData.get('knowledgeQuizJson');
  if (quizField === null) {
    nextKnowledgeQuiz = bundle.lesson.knowledgeQuizJson;
  } else if (typeof quizField !== 'string' || !quizField.trim()) {
    nextKnowledgeQuiz = null;
  } else {
    try {
      const raw = JSON.parse(quizField) as unknown;
      const r = knowledgeQuizDataSchema.safeParse(raw);
      if (!r.success) {
        nextKnowledgeQuiz = bundle.lesson.knowledgeQuizJson;
      } else if (r.data.items.length === 0) {
        nextKnowledgeQuiz = null;
      } else {
        nextKnowledgeQuiz = r.data;
      }
    } catch {
      nextKnowledgeQuiz = bundle.lesson.knowledgeQuizJson;
    }
  }

  await db
    .update(lessons)
    .set({
      titleEn: parsed.data.titleEn.trim(),
      titleEs: parsed.data.titleEs.trim(),
      summaryEn: parsed.data.summaryEn?.trim() || null,
      summaryEs: parsed.data.summaryEs?.trim() || null,
      reflectionPromptEn: parsed.data.reflectionPromptEn?.trim() || null,
      reflectionPromptEs: parsed.data.reflectionPromptEs?.trim() || null,
      actionStepsEn: parsed.data.actionStepsEn?.trim() || null,
      actionStepsEs: parsed.data.actionStepsEs?.trim() || null,
      estimatedMinutes: est != null && est > 0 ? est : null,
      legacyHtmlPath: parsed.data.legacyHtmlPath?.trim() || null,
      knowledgeQuizJson: nextKnowledgeQuiz,
    })
    .where(eq(lessons.id, bundle.lesson.id));

  return { ok: true, savedAt: new Date().toISOString() };
}

export async function attachLessonEmbedAction(formData: FormData) {
  const user = await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      lessonKey: z.string().min(1),
      url: z.string().min(1).max(2000),
      caption: z.string().max(2000).optional().nullable(),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      lessonKey: formData.get('lessonKey'),
      url: formData.get('url'),
      caption: formData.get('caption'),
    });

  if (!parsed.success) return { ok: false as const, error: 'invalid' as const };

  const embed = parseVideoEmbedUrl(parsed.data.url);
  if (!embed) {
    return { ok: false as const, error: 'unsupported_url' as const };
  }

  const bundle = await getLessonByCourseSlugAndKeyForAdmin(
    parsed.data.courseSlug,
    parsed.data.lessonKey
  );
  if (!bundle) return { ok: false as const, error: 'not_found' as const };

  const [maxRow] = await db
    .select({ max: sql<number>`max(${lessonAssets.sortOrder})` })
    .from(lessonAssets)
    .where(
      and(
        eq(lessonAssets.lessonId, bundle.lesson.id),
        isNull(lessonAssets.deletedAt)
      )
    );
  const nextOrder = (maxRow?.max ?? -1) + 1;

  const meta: Record<string, unknown> = {};
  if (parsed.data.caption?.trim()) meta.caption = parsed.data.caption.trim();
  meta.provider = embed.provider;

  await db.insert(lessonAssets).values({
    lessonId: bundle.lesson.id,
    kind: 'embed',
    storageKey: null,
    publicUrl: null,
    embedUrl: parsed.data.url.trim(),
    mimeType: null,
    byteSize: null,
    sortOrder: nextOrder,
    mediaAssetId: null,
    uploadedByUserId: user.id,
    metadata: meta,
  });

  revalidateCourseStudio(parsed.data.courseSlug);
  revalidatePath('/dashboard/courses', 'layout');
  return { ok: true as const };
}

export async function reorderLessonAssetsAction(formData: FormData) {
  await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      lessonKey: z.string().min(1),
      orderedIds: z.string().min(1),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      lessonKey: formData.get('lessonKey'),
      orderedIds: formData.get('orderedIds'),
    });

  if (!parsed.success) return { ok: false as const, error: 'invalid' as const };

  const ids = parsed.data.orderedIds
    .split(',')
    .map((x) => Number(x.trim()))
    .filter((x) => Number.isFinite(x));
  if (ids.length === 0) return { ok: false as const, error: 'invalid' as const };

  const bundle = await getLessonByCourseSlugAndKeyForAdmin(
    parsed.data.courseSlug,
    parsed.data.lessonKey
  );
  if (!bundle) return { ok: false as const, error: 'not_found' as const };

  await db.transaction(async (tx) => {
    for (let i = 0; i < ids.length; i++) {
      await tx
        .update(lessonAssets)
        .set({ sortOrder: -1000 - i, updatedAt: new Date() })
        .where(
          and(
            eq(lessonAssets.id, ids[i]!),
            eq(lessonAssets.lessonId, bundle.lesson.id),
            isNull(lessonAssets.deletedAt)
          )
        );
    }
    for (let i = 0; i < ids.length; i++) {
      await tx
        .update(lessonAssets)
        .set({ sortOrder: i, updatedAt: new Date() })
        .where(
          and(
            eq(lessonAssets.id, ids[i]!),
            eq(lessonAssets.lessonId, bundle.lesson.id),
            isNull(lessonAssets.deletedAt)
          )
        );
    }
  });

  revalidateCourseStudio(parsed.data.courseSlug);
  revalidatePath('/dashboard/courses', 'layout');
  return { ok: true as const };
}

export async function updateLessonAssetMetaAction(formData: FormData) {
  await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      lessonKey: z.string().min(1),
      placementId: z.coerce.number().int().positive(),
      alt: z.string().max(2000).optional().nullable(),
      caption: z.string().max(2000).optional().nullable(),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      lessonKey: formData.get('lessonKey'),
      placementId: formData.get('placementId'),
      alt: formData.get('alt'),
      caption: formData.get('caption'),
    });

  if (!parsed.success) return { ok: false as const, error: 'invalid' as const };

  const bundle = await getLessonByCourseSlugAndKeyForAdmin(
    parsed.data.courseSlug,
    parsed.data.lessonKey
  );
  if (!bundle) return { ok: false as const, error: 'not_found' as const };

  const [row] = await db
    .select()
    .from(lessonAssets)
    .where(
      and(
        eq(lessonAssets.id, parsed.data.placementId),
        eq(lessonAssets.lessonId, bundle.lesson.id),
        isNull(lessonAssets.deletedAt)
      )
    )
    .limit(1);

  if (!row) return { ok: false as const, error: 'not_found' as const };

  const patch: LessonAssetUiMetadata = {};
  if (parsed.data.alt !== undefined) patch.alt = parsed.data.alt?.trim() ?? '';
  if (parsed.data.caption !== undefined) {
    patch.caption = parsed.data.caption?.trim() ?? '';
  }

  const nextMeta = mergeLessonAssetMetadata(
    { ...(row.metadata as Record<string, unknown>) },
    patch
  );

  await db
    .update(lessonAssets)
    .set({
      metadata: nextMeta as Record<string, unknown>,
      updatedAt: new Date(),
    })
    .where(eq(lessonAssets.id, row.id));

  revalidateCourseStudio(parsed.data.courseSlug);
  revalidatePath('/dashboard/courses', 'layout');
  return { ok: true as const };
}

export async function duplicateLessonAction(formData: FormData) {
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

  if (!parsed.success) return { ok: false as const, error: 'invalid' as const };

  const bundle = await getLessonByCourseSlugAndKeyForAdmin(
    parsed.data.courseSlug,
    parsed.data.lessonKey
  );
  if (!bundle) return { ok: false as const, error: 'not_found' as const };

  const placements = await listLessonPlacementsOrdered(bundle.lesson.id);

  const baseKey = slugifyTitle(`${bundle.lesson.lessonKey}-copy`).slice(0, 120);
  let lessonKey = baseKey;
  let n = 2;
  for (;;) {
    const clash = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(
        and(eq(lessons.moduleId, bundle.lesson.moduleId), eq(lessons.lessonKey, lessonKey))
      )
      .limit(1);
    if (clash.length === 0) break;
    const suffix = `-${n++}`;
    lessonKey = `${baseKey.slice(0, 120 - suffix.length)}${suffix}`;
  }

  const [maxRow] = await db
    .select({ max: sql<number>`max(${lessons.sortOrder})` })
    .from(lessons)
    .where(
      and(eq(lessons.moduleId, bundle.lesson.moduleId), isNull(lessons.deletedAt))
    );
  const nextOrder = (maxRow?.max ?? -1) + 1;

  const src = bundle.lesson;

  await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(lessons)
      .values({
        moduleId: src.moduleId,
        lessonKey,
        sortOrder: nextOrder,
        titleEn: `${src.titleEn} (copy)`,
        titleEs: `${src.titleEs} (copy)`,
        legacyHtmlPath: src.legacyHtmlPath,
        draftBodyMarkdown: src.draftBodyMarkdown,
        publishedBodyMarkdown: src.publishedBodyMarkdown,
        draftBodyBlocks: src.draftBodyBlocks,
        publishedBodyBlocks: src.publishedBodyBlocks,
        lessonPublishedAt: src.lessonPublishedAt,
        summaryEn: src.summaryEn,
        summaryEs: src.summaryEs,
        reflectionPromptEn: src.reflectionPromptEn,
        reflectionPromptEs: src.reflectionPromptEs,
        actionStepsEn: src.actionStepsEn,
        actionStepsEs: src.actionStepsEs,
        knowledgeQuizJson: src.knowledgeQuizJson,
        estimatedMinutes: src.estimatedMinutes,
      })
      .returning({ id: lessons.id });

    const newLessonId = inserted!.id;

    for (let i = 0; i < placements.length; i++) {
      const p = placements[i]!.placement;
      await tx.insert(lessonAssets).values({
        lessonId: newLessonId,
        kind: p.kind,
        locale: p.locale,
        storageKey: p.storageKey,
        publicUrl: p.publicUrl,
        embedUrl: p.embedUrl,
        mimeType: p.mimeType,
        byteSize: p.byteSize,
        sortOrder: i,
        mediaAssetId: p.mediaAssetId,
        uploadedByUserId: p.uploadedByUserId,
        metadata: p.metadata,
      });
    }
  });

  revalidateCourseStudio(parsed.data.courseSlug);
  revalidatePath('/dashboard/courses', 'layout');
  return { ok: true as const, lessonKey };
}

export async function duplicateModuleAction(formData: FormData) {
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

  if (!parsed.success) return { ok: false as const, error: 'invalid' as const };

  const course = await getAdminCourseBySlug(parsed.data.courseSlug);
  if (!course) return { ok: false as const, error: 'not_found' as const };

  const mod = await getAdminModuleBySlug(course.id, parsed.data.moduleSlug);
  if (!mod) return { ok: false as const, error: 'not_found' as const };

  const outline = await getCourseOutlineForAdmin(course.id);
  const block = outline.find((m) => m.id === mod.id);
  if (!block) return { ok: false as const, error: 'not_found' as const };

  const baseSlug = slugifyTitle(`${mod.slug}-copy`).slice(0, 120);
  let moduleSlug = baseSlug;
  let sn = 2;
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
    const suffix = `-${sn++}`;
    moduleSlug = `${baseSlug.slice(0, 120 - suffix.length)}${suffix}`;
  }

  const [maxMod] = await db
    .select({ max: sql<number>`max(${courseModules.sortOrder})` })
    .from(courseModules)
    .where(
      and(eq(courseModules.courseId, course.id), isNull(courseModules.deletedAt))
    );
  const nextModOrder = (maxMod?.max ?? -1) + 1;

  const lessonList = [...block.lessons].sort((a, b) => a.sortOrder - b.sortOrder);
  const placementsByLessonId = new Map<
    number,
    Awaited<ReturnType<typeof listLessonPlacementsOrdered>>
  >();
  for (const l of lessonList) {
    placementsByLessonId.set(l.id, await listLessonPlacementsOrdered(l.id));
  }

  await db.transaction(async (tx) => {
    const [newMod] = await tx
      .insert(courseModules)
      .values({
        courseId: course.id,
        slug: moduleSlug,
        sortOrder: nextModOrder,
        titleEn: `${mod.titleEn} (copy)`,
        titleEs: `${mod.titleEs} (copy)`,
        descriptionEn: mod.descriptionEn,
        descriptionEs: mod.descriptionEs,
        legacyFolder: mod.legacyFolder,
      })
      .returning({ id: courseModules.id });

    const newModuleId = newMod!.id;

    for (let li = 0; li < lessonList.length; li++) {
      const lessonRow = lessonList[li]!;
      const placements = placementsByLessonId.get(lessonRow.id) ?? [];

      const baseKey = slugifyTitle(`${lessonRow.lessonKey}-copy`).slice(0, 120);
      let lessonKey = baseKey;
      let nk = 2;
      for (;;) {
        const clash = await tx
          .select({ id: lessons.id })
          .from(lessons)
          .where(
            and(eq(lessons.moduleId, newModuleId), eq(lessons.lessonKey, lessonKey))
          )
          .limit(1);
        if (clash.length === 0) break;
        const suffix = `-${nk++}`;
        lessonKey = `${baseKey.slice(0, 120 - suffix.length)}${suffix}`;
      }

      const [insertedLesson] = await tx
        .insert(lessons)
        .values({
          moduleId: newModuleId,
          lessonKey,
          sortOrder: li,
          titleEn: lessonRow.titleEn,
          titleEs: lessonRow.titleEs,
          legacyHtmlPath: lessonRow.legacyHtmlPath,
          draftBodyMarkdown: lessonRow.draftBodyMarkdown,
          publishedBodyMarkdown: lessonRow.publishedBodyMarkdown,
          draftBodyBlocks: lessonRow.draftBodyBlocks,
          publishedBodyBlocks: lessonRow.publishedBodyBlocks,
          lessonPublishedAt: lessonRow.lessonPublishedAt,
          summaryEn: lessonRow.summaryEn,
          summaryEs: lessonRow.summaryEs,
          reflectionPromptEn: lessonRow.reflectionPromptEn,
          reflectionPromptEs: lessonRow.reflectionPromptEs,
          actionStepsEn: lessonRow.actionStepsEn,
          actionStepsEs: lessonRow.actionStepsEs,
          estimatedMinutes: lessonRow.estimatedMinutes,
        })
        .returning({ id: lessons.id });

      const newLessonId = insertedLesson!.id;

      for (let pi = 0; pi < placements.length; pi++) {
        const p = placements[pi]!.placement;
        await tx.insert(lessonAssets).values({
          lessonId: newLessonId,
          kind: p.kind,
          locale: p.locale,
          storageKey: p.storageKey,
          publicUrl: p.publicUrl,
          embedUrl: p.embedUrl,
          mimeType: p.mimeType,
          byteSize: p.byteSize,
          sortOrder: pi,
          mediaAssetId: p.mediaAssetId,
          uploadedByUserId: p.uploadedByUserId,
          metadata: p.metadata,
        });
      }
    }
  });

  revalidateCourseStudio(parsed.data.courseSlug);
  revalidatePath('/dashboard/courses', 'layout');
  return { ok: true as const, moduleSlug };
}
