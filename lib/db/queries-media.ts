import 'server-only';

import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  or,
} from 'drizzle-orm';
import { db } from './drizzle';
import {
  courseAssets,
  courseModules,
  courses,
  lessonAssets,
  lessons,
  mediaAssets,
  users,
  type MediaAssetKind,
} from './schema';

const MEDIA_KINDS_SET = new Set<string>([
  'image',
  'pdf',
  'video',
  'audio',
  'attachment',
]);

export function parseMediaKind(
  raw: string | undefined
): MediaAssetKind | undefined {
  if (!raw || !MEDIA_KINDS_SET.has(raw)) return undefined;
  return raw as MediaAssetKind;
}

export async function listMediaAssets(opts: {
  kind?: MediaAssetKind;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const limit = Math.min(Math.max(opts.limit ?? 48, 1), 100);
  const offset = Math.max(opts.offset ?? 0, 0);

  const conditions = [isNull(mediaAssets.deletedAt)] as ReturnType<
    typeof eq
  >[];

  if (opts.kind) {
    conditions.push(eq(mediaAssets.kind, opts.kind));
  }

  const q = opts.search?.trim();
  if (q) {
    const pat = `%${q.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
    conditions.push(
      or(
        ilike(mediaAssets.originalFilename, pat),
        ilike(mediaAssets.storageKey, pat),
        ilike(mediaAssets.publicUrl, pat)
      )!
    );
  }

  const rows = await db
    .select({
      asset: mediaAssets,
      uploaderEmail: users.email,
      uploaderName: users.name,
    })
    .from(mediaAssets)
    .leftJoin(users, eq(mediaAssets.uploadedByUserId, users.id))
    .where(and(...conditions))
    .orderBy(desc(mediaAssets.createdAt), desc(mediaAssets.id))
    .limit(limit)
    .offset(offset);

  return rows;
}

export async function listDeletedMediaAssets(opts?: { limit?: number }) {
  const limit = Math.min(Math.max(opts?.limit ?? 24, 1), 100);
  return db
    .select({
      asset: mediaAssets,
      uploaderEmail: users.email,
    })
    .from(mediaAssets)
    .leftJoin(users, eq(mediaAssets.uploadedByUserId, users.id))
    .where(isNotNull(mediaAssets.deletedAt))
    .orderBy(desc(mediaAssets.updatedAt), desc(mediaAssets.id))
    .limit(limit);
}

export async function getMediaAssetByPublicId(publicId: string) {
  const rows = await db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.publicId, publicId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getMediaAssetById(id: number) {
  const rows = await db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .limit(1);
  return rows[0] ?? null;
}

/** Active lesson placements for this canonical asset */
export async function countLessonPlacementsForAsset(mediaAssetId: number) {
  const [row] = await db
    .select({ n: count() })
    .from(lessonAssets)
    .where(
      and(
        eq(lessonAssets.mediaAssetId, mediaAssetId),
        isNull(lessonAssets.deletedAt)
      )
    );
  return row?.n ?? 0;
}

export async function countCoursePlacementsForAsset(mediaAssetId: number) {
  const [row] = await db
    .select({ n: count() })
    .from(courseAssets)
    .where(
      and(
        eq(courseAssets.mediaAssetId, mediaAssetId),
        isNull(courseAssets.deletedAt)
      )
    );
  return row?.n ?? 0;
}

export async function countAllPlacementsForAsset(mediaAssetId: number) {
  const [lessons, courses_] = await Promise.all([
    countLessonPlacementsForAsset(mediaAssetId),
    countCoursePlacementsForAsset(mediaAssetId),
  ]);
  return { lessonPlacements: lessons, coursePlacements: courses_ };
}

/** Batch usage counts for media browser cards */
export async function countPlacementsByMediaAssetIds(assetIds: number[]) {
  const map = new Map<
    number,
    { lessonPlacements: number; coursePlacements: number }
  >();
  for (const id of assetIds) {
    map.set(id, { lessonPlacements: 0, coursePlacements: 0 });
  }
  if (assetIds.length === 0) return map;

  const [lessonRows, courseRows] = await Promise.all([
    db
      .select({
        mediaAssetId: lessonAssets.mediaAssetId,
        n: count(),
      })
      .from(lessonAssets)
      .where(
        and(
          inArray(lessonAssets.mediaAssetId, assetIds),
          isNull(lessonAssets.deletedAt)
        )
      )
      .groupBy(lessonAssets.mediaAssetId),
    db
      .select({
        mediaAssetId: courseAssets.mediaAssetId,
        n: count(),
      })
      .from(courseAssets)
      .where(
        and(
          inArray(courseAssets.mediaAssetId, assetIds),
          isNull(courseAssets.deletedAt)
        )
      )
      .groupBy(courseAssets.mediaAssetId),
  ]);

  for (const r of lessonRows) {
    if (r.mediaAssetId == null) continue;
    const cur = map.get(r.mediaAssetId);
    if (cur) cur.lessonPlacements = Number(r.n);
  }
  for (const r of courseRows) {
    if (r.mediaAssetId == null) continue;
    const cur = map.get(r.mediaAssetId);
    if (cur) cur.coursePlacements = Number(r.n);
  }
  return map;
}

export type LessonAssetWithMedia = {
  placement: typeof lessonAssets.$inferSelect;
  media: typeof mediaAssets.$inferSelect;
};

export async function listLessonAssetsForAdmin(
  lessonId: number
): Promise<LessonAssetWithMedia[]> {
  const rows = await db
    .select({
      placement: lessonAssets,
      media: mediaAssets,
    })
    .from(lessonAssets)
    .innerJoin(mediaAssets, eq(lessonAssets.mediaAssetId, mediaAssets.id))
    .where(
      and(
        eq(lessonAssets.lessonId, lessonId),
        isNull(lessonAssets.deletedAt),
        isNull(mediaAssets.deletedAt)
      )
    )
    .orderBy(asc(lessonAssets.sortOrder), asc(lessonAssets.id));

  return rows;
}

/** Upload + linked media rows (excludes embed-only placements). */
export type LessonPlacementRow = {
  placement: typeof lessonAssets.$inferSelect;
  media: typeof mediaAssets.$inferSelect | null;
};

/**
 * All active placements for a lesson: uploads (with media row) and embeds (media null).
 */
export async function listLessonPlacementsOrdered(
  lessonId: number
): Promise<LessonPlacementRow[]> {
  return db
    .select({
      placement: lessonAssets,
      media: mediaAssets,
    })
    .from(lessonAssets)
    .leftJoin(mediaAssets, eq(lessonAssets.mediaAssetId, mediaAssets.id))
    .where(
      and(eq(lessonAssets.lessonId, lessonId), isNull(lessonAssets.deletedAt))
    )
    .orderBy(asc(lessonAssets.sortOrder), asc(lessonAssets.id));
}

/**
 * Batch-load placements for every lesson in a course (single query).
 */
export async function listLessonPlacementsForCourse(courseId: number) {
  const rows = await db
    .select({
      placement: lessonAssets,
      media: mediaAssets,
      lessonId: lessons.id,
    })
    .from(lessonAssets)
    .innerJoin(lessons, eq(lessonAssets.lessonId, lessons.id))
    .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
    .leftJoin(mediaAssets, eq(lessonAssets.mediaAssetId, mediaAssets.id))
    .where(
      and(
        eq(courseModules.courseId, courseId),
        isNull(lessonAssets.deletedAt),
        isNull(lessons.deletedAt),
        isNull(courseModules.deletedAt)
      )
    )
    .orderBy(
      asc(courseModules.sortOrder),
      asc(lessons.sortOrder),
      asc(lessonAssets.sortOrder),
      asc(lessonAssets.id)
    );

  const byLesson = new Map<number, LessonPlacementRow[]>();
  for (const row of rows) {
    const list = byLesson.get(row.lessonId) ?? [];
    list.push({ placement: row.placement, media: row.media });
    byLesson.set(row.lessonId, list);
  }
  return byLesson;
}

export type CourseAssetWithMedia = {
  placement: typeof courseAssets.$inferSelect;
  media: typeof mediaAssets.$inferSelect;
};

export async function listCourseAssetsForAdmin(
  courseId: number
): Promise<CourseAssetWithMedia[]> {
  const rows = await db
    .select({
      placement: courseAssets,
      media: mediaAssets,
    })
    .from(courseAssets)
    .innerJoin(mediaAssets, eq(courseAssets.mediaAssetId, mediaAssets.id))
    .where(
      and(
        eq(courseAssets.courseId, courseId),
        isNull(courseAssets.deletedAt),
        isNull(mediaAssets.deletedAt)
      )
    )
    .orderBy(asc(courseAssets.sortOrder), asc(courseAssets.id));

  return rows;
}

/** Lesson belongs to course (for upload attach validation) */
export async function getLessonCourseIds(lessonId: number) {
  const rows = await db
    .select({
      lessonId: lessons.id,
      courseId: courses.id,
    })
    .from(lessons)
    .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
    .innerJoin(courses, eq(courseModules.courseId, courses.id))
    .where(eq(lessons.id, lessonId))
    .limit(1);

  return rows[0] ?? null;
}
