import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Params = { courseSlug: string };

export default async function AdminEditCoursePage(props: {
  params: Promise<Params>;
}) {
  const { courseSlug } = await props.params;
  redirect(`/admin/courses/${courseSlug}/studio`);
}
