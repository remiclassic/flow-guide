import { count } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { courses, users } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export default async function AdminHomePage() {
  const [userStats] = await db.select({ total: count() }).from(users);
  const [courseStats] = await db.select({ total: count() }).from(courses);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Lightweight counters to validate database connectivity. Extend with
          cohort analytics, refunds, or AI coach telemetry later.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Users
          </p>
          <p className="mt-3 text-3xl font-semibold">{userStats.total}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Courses
          </p>
          <p className="mt-3 text-3xl font-semibold">{courseStats.total}</p>
        </div>
      </div>
    </div>
  );
}
