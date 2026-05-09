import { revalidatePath } from 'next/cache';

export function revalidateCourseStudio(courseSlug: string) {
  revalidatePath(`/admin/courses/${courseSlug}/studio`);
}
