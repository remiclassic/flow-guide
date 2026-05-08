'use server';

import { revalidatePath } from 'next/cache';
import { requireCourseStaff } from '@/lib/admin/require-staff';
import { runLegacyCourseImport } from '@/lib/courses/legacy-course-import';
import type { LegacyCourseImportSummary } from '@/lib/courses/legacy-import-types';

export async function importLegacyCourseContentAction(
  _prev: LegacyCourseImportSummary | null,
  formData: FormData
): Promise<LegacyCourseImportSummary> {
  await requireCourseStaff();

  const courseSlug = formData.get('courseSlug')?.toString().trim() ?? '';
  const rawForce = formData.get('force');
  const forceRefresh =
    rawForce === 'on' ||
    rawForce === 'true' ||
    rawForce === '1';

  if (!courseSlug) {
    return {
      ok: false,
      courseSlug: '',
      results: [],
      logLines: ['Missing courseSlug in form.'],
    };
  }

  const summary = await runLegacyCourseImport({
    courseSlug,
    force: forceRefresh,
  });

  if (summary.ok) {
    revalidatePath(`/admin/courses/${courseSlug}/studio`, 'page');
    revalidatePath(`/admin/courses/${courseSlug}/preview`, 'page');
    revalidatePath('/dashboard/courses', 'layout');
  }

  return summary;
}
