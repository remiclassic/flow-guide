import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Params = { courseSlug: string; lessonKey: string };

export default async function AdminLessonEditPage(props: {
  params: Promise<Params>;
}) {
  const { courseSlug, lessonKey } = await props.params;
  redirect(
    `/admin/courses/${courseSlug}/studio?lesson=${encodeURIComponent(lessonKey)}`
  );
}
