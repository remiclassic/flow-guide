'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import {
  courseAssets,
  lessonAssets,
  mediaAssets,
} from '@/lib/db/schema';
import {
  getAdminCourseBySlug,
  getLessonByCourseSlugAndKeyForAdmin,
} from '@/lib/db/queries-admin';
import { getMediaAssetByPublicId } from '@/lib/db/queries-media';
import { requireCourseStaff } from '@/lib/admin/require-staff';
import { revalidateCourseStudio } from '@/lib/admin/revalidate-studio';

const uuidSchema = z.string().uuid();

export async function attachMediaToLessonAction(formData: FormData) {
  const user = await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      lessonKey: z.string().min(1),
      mediaAssetPublicId: uuidSchema,
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      lessonKey: formData.get('lessonKey'),
      mediaAssetPublicId: formData.get('mediaAssetPublicId'),
    });
  if (!parsed.success) return { ok: false as const, error: 'invalid' };

  const bundle = await getLessonByCourseSlugAndKeyForAdmin(
    parsed.data.courseSlug,
    parsed.data.lessonKey
  );
  if (!bundle) return { ok: false as const, error: 'not_found' };

  const asset = await getMediaAssetByPublicId(parsed.data.mediaAssetPublicId);
  if (!asset || asset.deletedAt) {
    return { ok: false as const, error: 'asset_missing' };
  }

  const [dup] = await db
    .select({ id: lessonAssets.id })
    .from(lessonAssets)
    .where(
      and(
        eq(lessonAssets.lessonId, bundle.lesson.id),
        eq(lessonAssets.mediaAssetId, asset.id),
        isNull(lessonAssets.deletedAt)
      )
    )
    .limit(1);
  if (dup) {
    revalidateCourseStudio(parsed.data.courseSlug);
    return { ok: true as const, duplicate: true };
  }

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

  await db.insert(lessonAssets).values({
    lessonId: bundle.lesson.id,
    kind: asset.kind,
    storageKey: asset.storageKey,
    publicUrl: asset.publicUrl,
    mimeType: asset.mimeType,
    byteSize: asset.byteSize,
    sortOrder: nextOrder,
    mediaAssetId: asset.id,
    uploadedByUserId: user.id,
  });

  revalidatePath('/admin/media');
  revalidateCourseStudio(parsed.data.courseSlug);
  revalidatePath(
    `/admin/courses/${parsed.data.courseSlug}/lessons/${parsed.data.lessonKey}/edit`
  );
  return { ok: true as const };
}

export async function attachMediaToCourseAction(formData: FormData) {
  const user = await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      mediaAssetPublicId: uuidSchema,
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      mediaAssetPublicId: formData.get('mediaAssetPublicId'),
    });
  if (!parsed.success) return { ok: false as const, error: 'invalid' };

  const course = await getAdminCourseBySlug(parsed.data.courseSlug);
  if (!course) return { ok: false as const, error: 'not_found' };

  const asset = await getMediaAssetByPublicId(parsed.data.mediaAssetPublicId);
  if (!asset || asset.deletedAt) {
    return { ok: false as const, error: 'asset_missing' };
  }

  const [dup] = await db
    .select({ id: courseAssets.id })
    .from(courseAssets)
    .where(
      and(
        eq(courseAssets.courseId, course.id),
        eq(courseAssets.mediaAssetId, asset.id),
        isNull(courseAssets.deletedAt)
      )
    )
    .limit(1);
  if (dup) {
    revalidateCourseStudio(parsed.data.courseSlug);
    return { ok: true as const, duplicate: true };
  }

  const [maxRow] = await db
    .select({ max: sql<number>`max(${courseAssets.sortOrder})` })
    .from(courseAssets)
    .where(
      and(
        eq(courseAssets.courseId, course.id),
        isNull(courseAssets.deletedAt)
      )
    );
  const nextOrder = (maxRow?.max ?? -1) + 1;

  await db.insert(courseAssets).values({
    courseId: course.id,
    kind: asset.kind,
    storageKey: asset.storageKey,
    publicUrl: asset.publicUrl,
    mimeType: asset.mimeType,
    byteSize: asset.byteSize,
    sortOrder: nextOrder,
    mediaAssetId: asset.id,
    uploadedByUserId: user.id,
  });

  revalidatePath('/admin/media');
  revalidateCourseStudio(parsed.data.courseSlug);
  return { ok: true as const };
}

export async function detachLessonPlacementAction(formData: FormData) {
  await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      lessonKey: z.string().min(1),
      placementId: z.coerce.number().int().positive(),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      lessonKey: formData.get('lessonKey'),
      placementId: formData.get('placementId'),
    });
  if (!parsed.success) return;

  const bundle = await getLessonByCourseSlugAndKeyForAdmin(
    parsed.data.courseSlug,
    parsed.data.lessonKey
  );
  if (!bundle) return;

  await db
    .update(lessonAssets)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(lessonAssets.id, parsed.data.placementId),
        eq(lessonAssets.lessonId, bundle.lesson.id),
        isNull(lessonAssets.deletedAt)
      )
    );

  revalidatePath('/admin/media');
  revalidateCourseStudio(parsed.data.courseSlug);
}

export async function detachCoursePlacementAction(formData: FormData) {
  await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      placementId: z.coerce.number().int().positive(),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      placementId: formData.get('placementId'),
    });
  if (!parsed.success) return;

  const course = await getAdminCourseBySlug(parsed.data.courseSlug);
  if (!course) return;

  await db
    .update(courseAssets)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(courseAssets.id, parsed.data.placementId),
        eq(courseAssets.courseId, course.id),
        isNull(courseAssets.deletedAt)
      )
    );

  revalidatePath('/admin/media');
  revalidateCourseStudio(parsed.data.courseSlug);
}

export async function softDeleteMediaAssetAction(formData: FormData) {
  await requireCourseStaff();

  const parsed = z
    .object({ mediaAssetPublicId: uuidSchema })
    .safeParse({ mediaAssetPublicId: formData.get('mediaAssetPublicId') });
  if (!parsed.success) return;

  const row = await getMediaAssetByPublicId(parsed.data.mediaAssetPublicId);
  if (!row || row.deletedAt) return;

  await db
    .update(mediaAssets)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(mediaAssets.id, row.id));

  revalidatePath('/admin/media');
}

export async function restoreMediaAssetAction(formData: FormData) {
  await requireCourseStaff();

  const parsed = z
    .object({ mediaAssetPublicId: uuidSchema })
    .safeParse({ mediaAssetPublicId: formData.get('mediaAssetPublicId') });
  if (!parsed.success) return;

  const row = await getMediaAssetByPublicId(parsed.data.mediaAssetPublicId);
  if (!row || !row.deletedAt) return;

  await db
    .update(mediaAssets)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(mediaAssets.id, row.id));

  revalidatePath('/admin/media');
}

export async function updateMediaAssetMetadataAction(formData: FormData) {
  await requireCourseStaff();

  const parsed = z
    .object({
      mediaAssetPublicId: uuidSchema,
      alt: z.string().max(500).optional().nullable(),
      caption: z.string().max(2000).optional().nullable(),
    })
    .safeParse({
      mediaAssetPublicId: formData.get('mediaAssetPublicId'),
      alt: formData.get('alt'),
      caption: formData.get('caption'),
    });
  if (!parsed.success) return;

  const row = await getMediaAssetByPublicId(parsed.data.mediaAssetPublicId);
  if (!row || row.deletedAt) return;

  const meta = { ...row.metadata } as Record<string, unknown>;
  if (parsed.data.alt !== undefined) {
    if (parsed.data.alt === null || parsed.data.alt === '') {
      delete meta.alt;
    } else {
      meta.alt = parsed.data.alt;
    }
  }
  if (parsed.data.caption !== undefined) {
    if (parsed.data.caption === null || parsed.data.caption === '') {
      delete meta.caption;
    } else {
      meta.caption = parsed.data.caption;
    }
  }

  await db
    .update(mediaAssets)
    .set({ metadata: meta, updatedAt: new Date() })
    .where(eq(mediaAssets.id, row.id));

  revalidatePath('/admin/media');
}
