import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Params = { courseSlug: string; moduleSlug: string };

export default async function AdminModuleDetailPage(props: {
  params: Promise<Params>;
}) {
  const { courseSlug } = await props.params;
  redirect(`/admin/courses/${courseSlug}/studio`);
}
