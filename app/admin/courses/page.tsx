import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { listCoursesForAdmin } from '@/lib/db/queries-admin';
import type { CourseLifecycleStatus } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

function statusLabel(s: CourseLifecycleStatus): string {
  switch (s) {
    case 'draft':
      return 'Draft';
    case 'review':
      return 'In review';
    case 'scheduled':
      return 'Scheduled teaser';
    case 'published':
      return 'Published';
    case 'archived':
      return 'Archived';
    default:
      return s;
  }
}

export default async function AdminCoursesPage() {
  const rows = await listCoursesForAdmin();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
            Curriculum
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-4xl">
            Courses
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Create, edit, and launch learning paths.
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex h-11 w-fit items-center rounded-full bg-stone-950 px-6 text-sm font-medium text-white shadow-[0_18px_45px_-24px_rgba(28,25,23,0.55)] transition-colors hover:bg-stone-800"
        >
          New course
        </Link>
      </div>

      <ul className="divide-y divide-stone-200/80 overflow-hidden rounded-[1.75rem] border border-white/85 bg-white/82 shadow-[0_22px_64px_-44px_rgba(120,83,45,0.44)] backdrop-blur-sm">
        {rows.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-stone-500">
            No courses yet. Start with &quot;New course&quot;.
          </li>
        ) : (
          rows.map((c) => (
            <li
              key={c.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-stone-950">{c.title}</p>
                <p className="truncate font-mono text-xs text-stone-500">/{c.slug}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-stone-200 bg-stone-50/90 capitalize text-stone-700"
                >
                  {statusLabel(c.lifecycleStatus as CourseLifecycleStatus)}
                </Badge>
                <Link
                  href={`/admin/courses/${c.slug}/studio`}
                  className="rounded-full border border-stone-300/80 bg-white/80 px-3 py-1 text-xs font-medium text-stone-800 shadow-sm backdrop-blur transition-colors hover:bg-white"
                >
                  Studio
                </Link>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
