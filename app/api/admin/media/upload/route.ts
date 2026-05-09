import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/session';
import { revalidateCourseStudio } from '@/lib/admin/revalidate-studio';
import { db } from '@/lib/db/drizzle';
import {
  courseAssets,
  courses,
  isCourseStaffRole,
  lessonAssets,
  mediaAssets,
  type MediaAssetKind,
} from '@/lib/db/schema';
import { getLessonCourseIds } from '@/lib/db/queries-media';
import {
  getSupabaseAdmin,
  getSupabaseMediaBucketName,
  getSupabaseStorageConfigurationError,
} from '@/lib/supabase/admin';
import { interpretStorageUploadFailure } from '@/lib/supabase/storage-upload-errors';

const ALLOWED_PREFIXES = ['image/', 'video/', 'audio/', 'application/pdf'];
const MAX_BYTES = 25 * 1024 * 1024;

function mimeToKind(mime: string): MediaAssetKind {
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  return 'attachment';
}

export async function POST(request: Request) {
  const sessionCookie = (await cookies()).get('session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let userId: number;
  try {
    const payload = await verifyToken(sessionCookie);
    if (!payload.user?.role || !isCourseStaffRole(payload.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    userId = payload.user.id;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const storageConfigError = getSupabaseStorageConfigurationError();
  if (storageConfigError) {
    const bucket = getSupabaseMediaBucketName();
    return NextResponse.json(
      {
        error: 'Storage not configured',
        missingEnv: storageConfigError.missingVariables,
        message: storageConfigError.message,
        bucket,
        hint:
          'Create a public (or signed-URL) bucket in Supabase → Storage matching `bucket`, then redeploy with the vars above.',
      },
      { status: 503 }
    );
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      {
        error: 'Storage not configured',
        message:
          'Could not initialize Supabase admin client. Verify SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY, then restart `pnpm dev` if you just changed .env.',
        bucket: getSupabaseMediaBucketName(),
      },
      { status: 503 }
    );
  }
  const bucket = getSupabaseMediaBucketName();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 });
  }

  const mime = file.type || 'application/octet-stream';
  if (!ALLOWED_PREFIXES.some((p) => mime.startsWith(p))) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
  }

  const prefix = formData.get('prefix');
  const safePrefix =
    typeof prefix === 'string' && /^[a-z0-9/_-]+$/i.test(prefix)
      ? prefix.replace(/^\/+|\/+$/g, '')
      : 'uploads';

  const attachLessonRaw = formData.get('attachLessonId');
  const attachCourseRaw = formData.get('attachCourseId');
  const applyCoverRaw = formData.get('applyAsCourseCoverForCourseId');
  const attachLessonId =
    typeof attachLessonRaw === 'string' && attachLessonRaw.trim() !== ''
      ? Number(attachLessonRaw)
      : undefined;
  const attachCourseId =
    typeof attachCourseRaw === 'string' && attachCourseRaw.trim() !== ''
      ? Number(attachCourseRaw)
      : undefined;
  const applyAsCourseCoverForCourseId =
    typeof applyCoverRaw === 'string' && applyCoverRaw.trim() !== ''
      ? Number(applyCoverRaw)
      : undefined;

  if (
    attachLessonId !== undefined &&
    (!Number.isFinite(attachLessonId) || attachLessonId <= 0)
  ) {
    return NextResponse.json({ error: 'Invalid attachLessonId' }, { status: 400 });
  }
  if (
    attachCourseId !== undefined &&
    (!Number.isFinite(attachCourseId) || attachCourseId <= 0)
  ) {
    return NextResponse.json({ error: 'Invalid attachCourseId' }, { status: 400 });
  }
  if (
    applyAsCourseCoverForCourseId !== undefined &&
    (!Number.isFinite(applyAsCourseCoverForCourseId) ||
      applyAsCourseCoverForCourseId <= 0)
  ) {
    return NextResponse.json(
      { error: 'Invalid applyAsCourseCoverForCourseId' },
      { status: 400 }
    );
  }
  if (attachLessonId != null && attachCourseId != null) {
    return NextResponse.json(
      { error: 'Use only one of attachLessonId or attachCourseId' },
      { status: 400 }
    );
  }
  if (attachLessonId != null && applyAsCourseCoverForCourseId != null) {
    return NextResponse.json(
      {
        error:
          'Cannot combine attachLessonId with applyAsCourseCoverForCourseId',
      },
      { status: 400 }
    );
  }

  if (applyAsCourseCoverForCourseId != null && !mime.startsWith('image/')) {
    return NextResponse.json(
      { error: 'Course cover must be an image file' },
      { status: 400 }
    );
  }

  let coverCourseSlug: string | null = null;
  if (applyAsCourseCoverForCourseId != null) {
    const [courseRow] = await db
      .select({ id: courses.id, slug: courses.slug })
      .from(courses)
      .where(
        and(
          eq(courses.id, applyAsCourseCoverForCourseId),
          isNull(courses.deletedAt)
        )
      )
      .limit(1);
    if (!courseRow) {
      return NextResponse.json({ error: 'Course not found' }, { status: 400 });
    }
    coverCourseSlug = courseRow.slug;
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = file.name.includes('.')
    ? file.name.slice(file.name.lastIndexOf('.'))
    : '';
  const objectPath = `${safePrefix}/${crypto.randomUUID()}${ext}`;
  const kind = mimeToKind(mime);
  const originalFilename =
    file.name.length > 512 ? file.name.slice(0, 512) : file.name;

  const { error: uploadError } = await admin.storage
    .from(bucket)
    .upload(objectPath, buf, {
      contentType: mime,
      upsert: false,
    });

  if (uploadError) {
    console.error('Supabase upload error:', uploadError);
    const interpreted = interpretStorageUploadFailure(bucket, uploadError);
    return NextResponse.json(
      {
        error: interpreted.error,
        message: interpreted.message,
        bucket: interpreted.bucket,
        ...(interpreted.detail ? { detail: interpreted.detail } : {}),
      },
      { status: interpreted.status }
    );
  }

  const { data: pub } = admin.storage.from(bucket).getPublicUrl(objectPath);
  const publicUrl = pub.publicUrl;

  if (applyAsCourseCoverForCourseId != null && publicUrl.length > 512) {
    await admin.storage.from(bucket).remove([objectPath]);
    return NextResponse.json(
      {
        error:
          'Uploaded file URL is too long for the course cover field; contact support.',
      },
      { status: 400 }
    );
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(mediaAssets)
        .values({
          storageBucket: bucket,
          storageKey: objectPath,
          publicUrl,
          mimeType: mime,
          byteSize: buf.length,
          kind,
          originalFilename,
          uploadedByUserId: userId,
          source: 'upload',
        })
        .returning({
          id: mediaAssets.id,
          publicId: mediaAssets.publicId,
        });

      if (!inserted) {
        throw new Error('Failed to insert media_assets row');
      }

      if (attachLessonId != null) {
        const link = await getLessonCourseIds(attachLessonId);
        if (!link) {
          throw new Error('LESSON_NOT_FOUND');
        }

        const [dup] = await tx
          .select({ id: lessonAssets.id })
          .from(lessonAssets)
          .where(
            and(
              eq(lessonAssets.lessonId, attachLessonId),
              eq(lessonAssets.mediaAssetId, inserted.id),
              isNull(lessonAssets.deletedAt)
            )
          )
          .limit(1);
        if (!dup) {
          const [maxRow] = await tx
            .select({
              max: sql<number>`max(${lessonAssets.sortOrder})`,
            })
            .from(lessonAssets)
            .where(
              and(
                eq(lessonAssets.lessonId, attachLessonId),
                isNull(lessonAssets.deletedAt)
              )
            );
          const nextOrder = (maxRow?.max ?? -1) + 1;
          await tx.insert(lessonAssets).values({
            lessonId: attachLessonId,
            kind,
            storageKey: objectPath,
            publicUrl,
            mimeType: mime,
            byteSize: buf.length,
            sortOrder: nextOrder,
            mediaAssetId: inserted.id,
            uploadedByUserId: userId,
          });
        }
      }

      if (attachCourseId != null) {
        const [dup] = await tx
          .select({ id: courseAssets.id })
          .from(courseAssets)
          .where(
            and(
              eq(courseAssets.courseId, attachCourseId),
              eq(courseAssets.mediaAssetId, inserted.id),
              isNull(courseAssets.deletedAt)
            )
          )
          .limit(1);
        if (!dup) {
          const [maxRow] = await tx
            .select({
              max: sql<number>`max(${courseAssets.sortOrder})`,
            })
            .from(courseAssets)
            .where(
              and(
                eq(courseAssets.courseId, attachCourseId),
                isNull(courseAssets.deletedAt)
              )
            );
          const nextOrder = (maxRow?.max ?? -1) + 1;
          await tx.insert(courseAssets).values({
            courseId: attachCourseId,
            kind,
            storageKey: objectPath,
            publicUrl,
            mimeType: mime,
            byteSize: buf.length,
            sortOrder: nextOrder,
            mediaAssetId: inserted.id,
            uploadedByUserId: userId,
          });
        }
      }

      return inserted;
    });

    if (applyAsCourseCoverForCourseId != null && coverCourseSlug) {
      await db
        .update(courses)
        .set({
          heroImagePath: publicUrl,
          updatedAt: new Date(),
        })
        .where(eq(courses.id, applyAsCourseCoverForCourseId));
      revalidatePath('/admin/courses');
      revalidateCourseStudio(coverCourseSlug);
      revalidatePath('/dashboard/courses', 'layout');
    }

    return NextResponse.json({
      mediaAssetId: result.id,
      publicId: result.publicId,
      bucket,
      path: objectPath,
      publicUrl,
      mimeType: mime,
      byteSize: buf.length,
      kind,
    });
  } catch (e) {
    console.error('Media DB persistence failed:', e);
    await admin.storage.from(bucket).remove([objectPath]);
    if (e instanceof Error && e.message === 'LESSON_NOT_FOUND') {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to save media record' },
      { status: 500 }
    );
  }
}
