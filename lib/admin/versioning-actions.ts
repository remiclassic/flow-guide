'use server';

import { revalidatePath } from 'next/cache';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { requireCourseStaff } from '@/lib/admin/require-staff';
import { revalidateCourseStudio } from '@/lib/admin/revalidate-studio';
import {
  courseRowToSnapshot,
  lessonRowToSnapshot,
  type CourseVersionSnapshotV1,
} from '@/lib/admin/lesson-version-snapshot';
import {
  parseCourseVersionSnapshot,
  parseLessonVersionSnapshot,
} from '@/lib/admin/version-snapshot-zod';
import { db } from '@/lib/db/drizzle';
import { getAdminCourseBySlug } from '@/lib/db/queries-admin';
import {
  courseModules,
  courseVersions,
  courses,
  lessonVersions,
  lessons,
} from '@/lib/db/schema';
import type { LessonVersionSnapshotV1 } from '@/lib/admin/lesson-version-snapshot';

export type LessonVersionListItem = {
  id: number;
  createdAt: string;
  versionNote: string | null;
  createdByUserId: number | null;
  restoreSourceVersionId: number | null;
  previewTitle: string;
};

export type CourseVersionListItem = {
  id: number;
  createdAt: string;
  versionNote: string | null;
  createdByUserId: number | null;
  restoreSourceVersionId: number | null;
  previewTitle: string;
};

async function getLessonBundleForAdmin(courseSlug: string, lessonKey: string) {
  const course = await getAdminCourseBySlug(courseSlug);
  if (!course) return null;
  const row = await db
    .select({ lesson: lessons })
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
  const bundle = row[0];
  if (!bundle) return null;
  return { course, lesson: bundle.lesson };
}

export async function listLessonVersionsAction(
  courseSlug: string,
  lessonKey: string
): Promise<
  | { ok: true; versions: LessonVersionListItem[] }
  | { ok: false; error: 'not_found' }
> {
  await requireCourseStaff();

  const bundle = await getLessonBundleForAdmin(courseSlug, lessonKey);
  if (!bundle) return { ok: false, error: 'not_found' };

  const rows = await db
    .select()
    .from(lessonVersions)
    .where(eq(lessonVersions.lessonId, bundle.lesson.id))
    .orderBy(desc(lessonVersions.createdAt))
    .limit(80);

  const versions: LessonVersionListItem[] = rows.map((r) => {
    const snap = parseLessonVersionSnapshot(r.snapshot);
    return {
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      versionNote: r.versionNote,
      createdByUserId: r.createdByUserId,
      restoreSourceVersionId: r.restoreSourceVersionId,
      previewTitle: snap?.titleEn ?? '(Invalid snapshot)',
    };
  });

  return { ok: true, versions };
}

export async function listCourseVersionsAction(
  courseSlug: string
): Promise<
  | { ok: true; versions: CourseVersionListItem[] }
  | { ok: false; error: 'not_found' }
> {
  await requireCourseStaff();

  const course = await getAdminCourseBySlug(courseSlug);
  if (!course) return { ok: false, error: 'not_found' };

  const rows = await db
    .select()
    .from(courseVersions)
    .where(eq(courseVersions.courseId, course.id))
    .orderBy(desc(courseVersions.createdAt))
    .limit(80);

  const versions: CourseVersionListItem[] = rows.map((r) => {
    const snap = parseCourseVersionSnapshot(r.snapshot);
    return {
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      versionNote: r.versionNote,
      createdByUserId: r.createdByUserId,
      restoreSourceVersionId: r.restoreSourceVersionId,
      previewTitle: snap?.title ?? '(Invalid snapshot)',
    };
  });

  return { ok: true, versions };
}

export async function createLessonVersionSnapshotAction(
  formData: FormData
): Promise<
  | { ok: true; id: number }
  | { ok: false; error: 'invalid' | 'not_found' }
> {
  const user = await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      lessonKey: z.string().min(1),
      versionNote: z.string().max(500).optional().nullable(),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      lessonKey: formData.get('lessonKey'),
      versionNote: formData.get('versionNote'),
    });

  if (!parsed.success) return { ok: false, error: 'invalid' };

  const bundle = await getLessonBundleForAdmin(
    parsed.data.courseSlug,
    parsed.data.lessonKey
  );
  if (!bundle) return { ok: false, error: 'not_found' };

  const note = parsed.data.versionNote?.trim() || null;

  const [row] = await db
    .insert(lessonVersions)
    .values({
      lessonId: bundle.lesson.id,
      snapshot: lessonRowToSnapshot(bundle.lesson),
      createdByUserId: user.id,
      versionNote: note,
    })
    .returning({ id: lessonVersions.id });

  revalidateCourseStudio(parsed.data.courseSlug);
  revalidatePath('/dashboard/courses', 'layout');
  return { ok: true, id: row!.id };
}

export async function createCourseVersionSnapshotAction(
  formData: FormData
): Promise<
  | { ok: true; id: number }
  | { ok: false; error: 'invalid' | 'not_found' }
> {
  const user = await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      versionNote: z.string().max(500).optional().nullable(),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      versionNote: formData.get('versionNote'),
    });

  if (!parsed.success) return { ok: false, error: 'invalid' };

  const course = await getAdminCourseBySlug(parsed.data.courseSlug);
  if (!course) return { ok: false, error: 'not_found' };

  const note = parsed.data.versionNote?.trim() || null;

  const [row] = await db
    .insert(courseVersions)
    .values({
      courseId: course.id,
      snapshot: courseRowToSnapshot(course),
      createdByUserId: user.id,
      versionNote: note,
    })
    .returning({ id: courseVersions.id });

  revalidateCourseStudio(parsed.data.courseSlug);
  revalidatePath('/dashboard/courses', 'layout');
  return { ok: true, id: row!.id };
}

export async function getLessonVersionDetailAction(
  courseSlug: string,
  lessonKey: string,
  versionId: number
): Promise<
  | {
      ok: true;
      version: {
        id: number;
        createdAt: string;
        versionNote: string | null;
        snapshot: LessonVersionSnapshotV1;
      };
    }
  | { ok: false; error: 'not_found' | 'mismatch' }
> {
  await requireCourseStaff();

  const bundle = await getLessonBundleForAdmin(courseSlug, lessonKey);
  if (!bundle) return { ok: false, error: 'not_found' };

  const [row] = await db
    .select()
    .from(lessonVersions)
    .where(
      and(
        eq(lessonVersions.id, versionId),
        eq(lessonVersions.lessonId, bundle.lesson.id)
      )
    )
    .limit(1);

  if (!row) return { ok: false, error: 'not_found' };

  const snapshot = parseLessonVersionSnapshot(row.snapshot);
  if (!snapshot) return { ok: false, error: 'mismatch' };

  return {
    ok: true,
    version: {
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      versionNote: row.versionNote,
      snapshot,
    },
  };
}

export async function restoreLessonVersionAction(
  formData: FormData
): Promise<
  | { ok: true }
  | {
      ok: false;
      error:
        | 'invalid'
        | 'not_found'
        | 'bad_snapshot'
        | 'version_not_found';
    }
> {
  const user = await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      lessonKey: z.string().min(1),
      versionId: z.coerce.number().int().positive(),
      backupFirst: z.enum(['0', '1']).optional(),
      restoreNote: z.string().max(500).optional().nullable(),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      lessonKey: formData.get('lessonKey'),
      versionId: formData.get('versionId'),
      backupFirst: formData.get('backupFirst') ?? '1',
      restoreNote: formData.get('restoreNote'),
    });

  if (!parsed.success) return { ok: false, error: 'invalid' };

  const bundle = await getLessonBundleForAdmin(
    parsed.data.courseSlug,
    parsed.data.lessonKey
  );
  if (!bundle) return { ok: false, error: 'not_found' };

  const [versionRow] = await db
    .select()
    .from(lessonVersions)
    .where(
      and(
        eq(lessonVersions.id, parsed.data.versionId),
        eq(lessonVersions.lessonId, bundle.lesson.id)
      )
    )
    .limit(1);

  if (!versionRow) return { ok: false, error: 'version_not_found' };

  const snap = parseLessonVersionSnapshot(versionRow.snapshot);
  if (!snap) return { ok: false, error: 'bad_snapshot' };

  const backupFirst = parsed.data.backupFirst !== '0';

  await db.transaction(async (tx) => {
    if (backupFirst) {
      const [fresh] = await tx
        .select()
        .from(lessons)
        .where(eq(lessons.id, bundle.lesson.id))
        .limit(1);
      if (fresh) {
        await tx.insert(lessonVersions).values({
          lessonId: fresh.id,
          snapshot: lessonRowToSnapshot(fresh),
          createdByUserId: user.id,
          versionNote: 'Auto: backup before restore',
        });
      }
    }

    await tx
      .update(lessons)
      .set({
        draftBodyMarkdown: snap.draftBodyMarkdown,
        draftBodyBlocks: snap.draftBodyBlocks,
        knowledgeQuizJson: snap.knowledgeQuizJson,
        titleEn: snap.titleEn,
        titleEs: snap.titleEs,
        summaryEn: snap.summaryEn,
        summaryEs: snap.summaryEs,
        reflectionPromptEn: snap.reflectionPromptEn,
        reflectionPromptEs: snap.reflectionPromptEs,
        actionStepsEn: snap.actionStepsEn,
        actionStepsEs: snap.actionStepsEs,
        estimatedMinutes: snap.estimatedMinutes,
        legacyHtmlPath: snap.legacyHtmlPath,
      })
      .where(eq(lessons.id, bundle.lesson.id));

    const note =
      parsed.data.restoreNote?.trim() ||
      `Restored from version #${versionRow.id}`;

    await tx.insert(lessonVersions).values({
      lessonId: bundle.lesson.id,
      snapshot: snap,
      createdByUserId: user.id,
      versionNote: note,
      restoreSourceVersionId: versionRow.id,
    });
  });

  revalidateCourseStudio(parsed.data.courseSlug);
  revalidatePath('/dashboard/courses', 'layout');
  return { ok: true };
}

export async function getCourseVersionDetailAction(
  courseSlug: string,
  versionId: number
): Promise<
  | {
      ok: true;
      version: {
        id: number;
        createdAt: string;
        versionNote: string | null;
        snapshot: CourseVersionSnapshotV1;
      };
    }
  | { ok: false; error: 'not_found' | 'mismatch' }
> {
  await requireCourseStaff();

  const course = await getAdminCourseBySlug(courseSlug);
  if (!course) return { ok: false, error: 'not_found' };

  const [row] = await db
    .select()
    .from(courseVersions)
    .where(
      and(
        eq(courseVersions.id, versionId),
        eq(courseVersions.courseId, course.id)
      )
    )
    .limit(1);

  if (!row) return { ok: false, error: 'not_found' };

  const snapshot = parseCourseVersionSnapshot(row.snapshot);
  if (!snapshot) return { ok: false, error: 'mismatch' };

  return {
    ok: true,
    version: {
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      versionNote: row.versionNote,
      snapshot,
    },
  };
}

export async function restoreCourseVersionAction(
  formData: FormData
): Promise<
  | { ok: true }
  | {
      ok: false;
      error:
        | 'invalid'
        | 'not_found'
        | 'bad_snapshot'
        | 'version_not_found';
    }
> {
  const user = await requireCourseStaff();

  const parsed = z
    .object({
      courseSlug: z.string().min(1),
      versionId: z.coerce.number().int().positive(),
      backupFirst: z.enum(['0', '1']).optional(),
      restoreNote: z.string().max(500).optional().nullable(),
    })
    .safeParse({
      courseSlug: formData.get('courseSlug'),
      versionId: formData.get('versionId'),
      backupFirst: formData.get('backupFirst') ?? '1',
      restoreNote: formData.get('restoreNote'),
    });

  if (!parsed.success) return { ok: false, error: 'invalid' };

  const course = await getAdminCourseBySlug(parsed.data.courseSlug);
  if (!course) return { ok: false, error: 'not_found' };

  const [versionRow] = await db
    .select()
    .from(courseVersions)
    .where(
      and(
        eq(courseVersions.id, parsed.data.versionId),
        eq(courseVersions.courseId, course.id)
      )
    )
    .limit(1);

  if (!versionRow) return { ok: false, error: 'version_not_found' };

  const snap = parseCourseVersionSnapshot(versionRow.snapshot);
  if (!snap) return { ok: false, error: 'bad_snapshot' };

  const backupFirst = parsed.data.backupFirst !== '0';

  await db.transaction(async (tx) => {
    if (backupFirst) {
      const [fresh] = await tx
        .select()
        .from(courses)
        .where(eq(courses.id, course.id))
        .limit(1);
      if (fresh) {
        await tx.insert(courseVersions).values({
          courseId: fresh.id,
          snapshot: courseRowToSnapshot(fresh),
          createdByUserId: user.id,
          versionNote: 'Auto: backup before restore',
        });
      }
    }

    await tx
      .update(courses)
      .set({
        title: snap.title,
        description: snap.description,
        heroImagePath: snap.heroImagePath,
        primaryLocale: snap.primaryLocale as 'en' | 'es',
        accessMode: snap.accessMode as 'subscription' | 'free',
        previewModuleCount: snap.previewModuleCount,
        previewLessonCount: snap.previewLessonCount,
        previewEstMinutes: snap.previewEstMinutes,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, course.id));

    const note =
      parsed.data.restoreNote?.trim() ||
      `Restored from version #${versionRow.id}`;

    await tx.insert(courseVersions).values({
      courseId: course.id,
      snapshot: snap,
      createdByUserId: user.id,
      versionNote: note,
      restoreSourceVersionId: versionRow.id,
    });
  });

  revalidateCourseStudio(parsed.data.courseSlug);
  revalidatePath('/admin/courses');
  revalidatePath('/dashboard/courses', 'layout');
  return { ok: true };
}
