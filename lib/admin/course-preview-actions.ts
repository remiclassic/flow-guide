'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireCourseStaff } from '@/lib/admin/require-staff';
import { getLessonByCourseSlugAndKeyForAdmin } from '@/lib/db/queries-admin';
import { setLessonCompleted } from '@/lib/db/queries';

const markSchema = z.object({
  courseSlug: z.string().min(1),
  lessonKey: z.string().min(1),
  completed: z.enum(['true', 'false']).optional(),
});

/**
 * Progress toggling from `/admin/courses/.../preview` only. Verifies course staff server-side
 * and does not require subscription (unlike customer `markLessonProgressAction`).
 */
export async function markLessonProgressStaffPreviewAction(
  formData: FormData
): Promise<void> {
  const staff = await requireCourseStaff();

  const parsed = markSchema.safeParse({
    courseSlug: formData.get('courseSlug'),
    lessonKey: formData.get('lessonKey'),
    completed: formData.get('completed') ?? 'true',
  });

  if (!parsed.success) return;

  const bundle = await getLessonByCourseSlugAndKeyForAdmin(
    parsed.data.courseSlug,
    parsed.data.lessonKey
  );

  if (!bundle) return;

  const completed = parsed.data.completed !== 'false';

  await setLessonCompleted({
    userId: staff.id,
    lessonId: bundle.lesson.id,
    completed,
  });

  const slug = parsed.data.courseSlug;
  revalidatePath(`/admin/courses/${slug}/preview`, 'page');
  revalidatePath(
    `/admin/courses/${slug}/preview/lessons/${parsed.data.lessonKey}`,
    'page'
  );
}
