import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, LineChart, ShieldCheck, Sparkles } from 'lucide-react';

export default function MarketingHomePage() {
  return (
    <main className="overflow-hidden bg-gradient-to-b from-white via-zinc-50 to-white">
      <section className="relative isolate px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-10 -z-10 mx-auto h-64 max-w-3xl rounded-full bg-amber-200/40 blur-3xl" />
        <div className="mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-900">
              Live cohorts · Stripe billing · Drizzle ORM
            </p>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
                The calm, premium home for transformational courses.
              </h1>
              <p className="max-w-2xl text-lg text-zinc-600">
                Glow Flow ships with authentication, subscription-gated lessons,
                tracked progress, and a preserved legacy viewer so you can
                migrate content without blocking launches.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-zinc-900 text-white hover:bg-zinc-800"
              >
                <Link href="/sign-up">
                  Start learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link href="/pricing">View membership</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="rounded-full">
                <Link href="/legacy">Legacy mirror</Link>
              </Button>
            </div>
          </div>

          <div className="flex-1 rounded-3xl border border-zinc-200 bg-white p-8 shadow-2xl shadow-amber-100/60">
            <div className="flex items-center gap-3">
              <LineChart className="h-10 w-10 text-amber-600" />
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Progress architecture
                </p>
                <p className="text-xl font-semibold text-zinc-900">
                  Ready for XP, streaks, coach nudges
                </p>
              </div>
            </div>
            <ul className="mt-8 space-y-4 text-sm text-zinc-600">
              <li className="flex gap-3">
                <ShieldCheck className="mt-1 h-4 w-4 text-emerald-600" />
                <span>
                  Paid routes check Stripe-backed team subscription state before
                  streaming lesson assets—even when content still lives in the
                  legacy HTML bundle.
                </span>
              </li>
              <li className="flex gap-3">
                <Sparkles className="mt-1 h-4 w-4 text-amber-600" />
                <span>
                  Dashboard routes stay mounted client-side with instant
                  navigation patterns suited for a game-like learning loop.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-100 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-3">
          {[
            {
              title: 'Modern stack',
              body: 'Next.js App Router, Tailwind v4, shadcn/ui, Drizzle + Postgres, Stripe subscriptions.',
            },
            {
              title: 'Expandable surfaces',
              body: 'Admin counters, AI coach placeholder, analytics-ready logging hooks, notifications-ready UI seams.',
            },
            {
              title: 'Grounded migration',
              body: 'Original Glow Flow HTML/CSS remains under `/legacy` until each lesson graduates to native MDX/React.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-zinc-100 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                Blueprint
              </p>
              <h3 className="mt-3 text-xl font-semibold text-zinc-900">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
