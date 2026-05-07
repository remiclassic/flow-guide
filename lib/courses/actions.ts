'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  getLessonByCourseSlugAndKey,
  getTeamForUser,
  getUser,
  setLessonCompleted,
  teamHasCourseAccess,
} from '@/lib/db/queries';

const markSchema = z.object({
  courseSlug: z.string().min(1),
  lessonKey: z.string().min(1),
  completed: z.enum(['true', 'false']).optional(),
});

export async function markLessonProgressAction(
  formData: FormData
): Promise<void> {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const team = await getTeamForUser();
  if (!teamHasCourseAccess(team)) {
    redirect('/pricing?reason=subscription');
  }

  const parsed = markSchema.safeParse({
    courseSlug: formData.get('courseSlug'),
    lessonKey: formData.get('lessonKey'),
    completed: formData.get('completed') ?? 'true',
  });

  if (!parsed.success) {
    return;
  }

  const bundle = await getLessonByCourseSlugAndKey(
    parsed.data.courseSlug,
    parsed.data.lessonKey
  );

  if (!bundle) {
    return;
  }

  const completed = parsed.data.completed !== 'false';

  await setLessonCompleted({
    userId: user.id,
    lessonId: bundle.lesson.id,
    completed,
  });

  revalidatePath(`/dashboard/courses/${parsed.data.courseSlug}`, 'page');
  revalidatePath(
    `/dashboard/courses/${parsed.data.courseSlug}/lessons/${parsed.data.lessonKey}`,
    'page'
  );
}
