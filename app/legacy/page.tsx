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
    <main className="min-h-screen bg-gradient-to-b from-[#fffaf2] via-[#fbf7f0] to-white px-4 py-16 text-stone-950">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-700">
            Course preview
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            Explore the Glow Flow course hub
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Preview the learning experience, then continue into the guided
            dashboard when you are ready to track your progress.
          </p>
        </div>

        <Card className="border-white/80 bg-white/85 text-stone-950 shadow-[0_24px_70px_-44px_rgba(120,83,45,0.44)] backdrop-blur">
          <CardHeader>
            <CardTitle>Open the course experience</CardTitle>
            <CardDescription className="text-stone-600">
              Step into the public course hub or begin from the landing
              experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="secondary" className="rounded-full">
              <Link href="/legacy/index.html">Landing</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/legacy/course/index.html">Course hub</Link>
            </Button>
          </CardContent>
        </Card>

        <p className="text-xs text-stone-500">
          Members can continue with saved progress in the{' '}
          <Link href="/dashboard/courses" className="text-amber-700 underline">
            course library
          </Link>{' '}
          .
        </p>
      </div>
    </main>
  );
}
