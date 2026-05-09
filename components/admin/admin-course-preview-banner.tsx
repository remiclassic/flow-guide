import Link from 'next/link';

export function AdminCoursePreviewBanner({
  courseSlug,
}: {
  courseSlug: string;
}) {
  return (
    <div className="mb-4 flex w-full max-w-none flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 shadow-sm backdrop-blur-[2px]">
      <p className="font-medium tracking-tight">
        Admin preview · unlocked customer view
      </p>
      <Link
        href={`/admin/courses/${courseSlug}/studio`}
        className="font-semibold text-amber-900 underline-offset-4 transition-colors hover:text-amber-950 hover:underline"
      >
        Back to Studio
      </Link>
    </div>
  );
}
