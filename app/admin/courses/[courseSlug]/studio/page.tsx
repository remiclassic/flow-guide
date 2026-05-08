import { notFound } from 'next/navigation';
import { CourseStudioClient } from '@/components/admin/course-studio-client';
import { getAdminCourseStudioPayload } from '@/lib/db/queries-admin';
import type { LessonPlacementRow } from '@/lib/db/queries-media';
import { listMediaAssets } from '@/lib/db/queries-media';

export const dynamic = 'force-dynamic';

type Params = { courseSlug: string };

export default async function CourseStudioPage(props: {
  params: Promise<Params>;
}) {
  const { courseSlug } = await props.params;
  const payload = await getAdminCourseStudioPayload(courseSlug);
  if (!payload) notFound();

  const libraryRows = await listMediaAssets({ limit: 100 });
  const libraryCandidates = libraryRows.map(({ asset }) => ({
    publicId: asset.publicId,
    kind: asset.kind,
    originalFilename: asset.originalFilename,
    storageKey: asset.storageKey,
    publicUrl: asset.publicUrl,
  }));

  const placementsByLesson: Record<string, LessonPlacementRow[]> = {};
  for (const [lessonId, rows] of payload.placementsByLesson) {
    placementsByLesson[String(lessonId)] = rows;
  }

  return (
    <CourseStudioClient
      courseSlug={courseSlug}
      course={payload.course}
      outline={payload.outline}
      placementsByLesson={placementsByLesson}
      libraryCandidates={libraryCandidates}
    />
  );
}
