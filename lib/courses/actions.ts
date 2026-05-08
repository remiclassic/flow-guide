'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  getLessonByCourseSlugAndKey,
  getTeamForUser,
  getUser,
  setLessonCompleted,
  teamHasCourseAccess
} from '@/lib/db/queries';
import { redirectLocalized } from '@/lib/i18n/redirect-localized';

const markSchema = z.object({
  courseSlug: z.string().min(1),
  lessonKey: z.string().min(1),
  completed: z.enum(['true', 'false']).optional()
});

export async function markLessonProgressAction(
  formData: FormData
): Promise<void> {
  const user = await getUser();
  if (!user) {
    return redirectLocalized({ href: '/sign-in' });
  }

  const team = await getTeamForUser();

  const parsed = markSchema.safeParse({
    courseSlug: formData.get('courseSlug'),
    lessonKey: formData.get('lessonKey'),
    completed: formData.get('completed') ?? 'true'
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

  const freeCourse = bundle.course.accessMode === 'free';
  if (!freeCourse && !teamHasCourseAccess(team)) {
    return redirectLocalized({
      href: {
        pathname: '/pricing',
        query: { reason: 'subscription' }
      }
    });
  }

  const completed = parsed.data.completed !== 'false';

  await setLessonCompleted({
    userId: user.id,
    lessonId: bundle.lesson.id,
    completed
  });

  revalidatePath(`/dashboard/courses/${parsed.data.courseSlug}`, 'page');
  revalidatePath(
    `/dashboard/courses/${parsed.data.courseSlug}/lessons/${parsed.data.lessonKey}`,
    'page'
  );
}
