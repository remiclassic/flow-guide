import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LegacySitePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black px-4 py-16 text-zinc-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-400">
            Legacy mirror
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            Static Glow Flow experience
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            The original GitHub Pages bundle now lives under{' '}
            <code className="rounded bg-white/10 px-2 py-1 text-xs text-amber-200">
              /legacy/
            </code>{' '}
            while the authenticated product moves onto the Next.js stack.
          </p>
        </div>

        <Card className="border-white/10 bg-white/5 text-zinc-50 shadow-xl backdrop-blur">
          <CardHeader>
            <CardTitle>Open the archived site</CardTitle>
            <CardDescription className="text-zinc-300">
              Links launch the untouched HTML/CSS assets for reference or
              migration QA.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="secondary" className="rounded-full">
              <Link href="/legacy/index.html">Landing</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/30">
              <Link href="/legacy/course/index.html">Course hub</Link>
            </Button>
          </CardContent>
        </Card>

        <p className="text-xs text-zinc-500">
          Authenticated learners should use{' '}
          <Link href="/dashboard/courses" className="text-amber-300 underline">
            /dashboard/courses
          </Link>{' '}
          for tracked progress.
        </p>
      </div>
    </main>
  );
}
