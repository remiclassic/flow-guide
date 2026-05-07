import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function CoachPlaceholderPage() {
  return (
    <section className="flex-1 space-y-6 p-4 lg:p-8">
      <div>
        <h1 className="text-lg font-medium lg:text-2xl">AI Coach</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accountability loops, nudges, and adaptive drills will plug in here.
          The route is wired so product work can move fast later.
        </p>
      </div>

      <Card className="border-dashed border-zinc-300 bg-zinc-50">
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            Planned capabilities: weekly commitments, streak surfacing,
            reflective prompts, and optional mentor tone presets—all backed by
            your progress graph.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No external calls are made yet; this page is a stable shell for UI
          experiments without risking billing or lesson integrity.
        </CardContent>
      </Card>
    </section>
  );
}
