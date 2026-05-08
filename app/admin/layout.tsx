import Link from 'next/link';
import { FlowLogoMark } from '@/components/brand/flow-logo';
import { requireCourseStaff } from '@/lib/admin/require-staff';

export const dynamic = 'force-dynamic';

const navLinkClass =
  'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCourseStaff();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#fbf7f0] text-stone-950">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_12%,rgba(255,219,171,0.35),transparent_26rem),radial-gradient(circle_at_82%_8%,rgba(196,181,253,0.22),transparent_28rem),linear-gradient(180deg,#fffaf2_0%,#f8f0e6_48%,#fbf7f0_100%)]"
        aria-hidden
      />
      <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-md shadow-card-soft">
        <div className="flex w-full max-w-none flex-col gap-4 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Link
            href="/admin"
            className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-90"
          >
            <FlowLogoMark size={40} fetchPriority="high" className="size-10 shrink-0" />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Flow Guide
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700">
                Creator hub
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email} · {user.role}
              </span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/admin" className={navLinkClass}>
              Overview
            </Link>
            <Link href="/admin/courses" className={navLinkClass}>
              Courses
            </Link>
            <Link href="/admin/media" className={navLinkClass}>
              Media library
            </Link>
            <Link
              href="/dashboard/courses"
              className={`${navLinkClass} rounded-full border border-stone-300/80 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur hover:bg-white`}
            >
              Learner app
            </Link>
          </nav>
        </div>
      </header>
      <main className="w-full max-w-none px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
