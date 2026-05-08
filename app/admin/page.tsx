import Link from 'next/link';
import { count } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { courses, users } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export default async function AdminHomePage() {
  const [userStats] = await db.select({ total: count() }).from(users);
  const [courseStats] = await db.select({ total: count() }).from(courses);

  return (
    <div className="space-y-10">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-4xl">
          Overview
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-600">
          Manage courses, lessons, and launches from here. Learners use the main
          app; this space is for creators only.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.75rem] border border-white/85 bg-white/82 p-6 shadow-[0_22px_64px_-44px_rgba(120,83,45,0.44)] backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            Learners
          </p>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-[-0.04em] text-stone-950">
            {userStats.total}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-white/85 bg-white/82 p-6 shadow-[0_22px_64px_-44px_rgba(120,83,45,0.44)] backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            Courses in database
          </p>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-[-0.04em] text-stone-950">
            {courseStats.total}
          </p>
        </div>
      </div>

      <Link
        href="/admin/courses"
        className="inline-flex h-11 items-center rounded-full bg-stone-950 px-7 text-sm font-medium text-white shadow-[0_18px_45px_-24px_rgba(28,25,23,0.55)] transition-colors hover:bg-stone-800"
      >
        Open courses
      </Link>
    </div>
  );
}
