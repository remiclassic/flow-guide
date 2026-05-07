import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function ActivityPageSkeleton() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="mb-1 h-7 w-48 animate-pulse rounded-md bg-muted lg:h-9 lg:w-56" />
      <div className="mb-6 h-4 w-full max-w-md animate-pulse rounded-md bg-muted" />
      <div className="mb-6 flex flex-wrap gap-2 border-b border-border/80 pb-3">
        <div className="h-9 w-28 animate-pulse rounded-full bg-muted" />
        <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
        <div className="h-9 w-36 animate-pulse rounded-full bg-muted" />
      </div>
      <Card className="border-border/80 shadow-card-soft">
        <CardHeader>
          <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-full max-w-lg animate-pulse rounded-md bg-muted" />
        </CardHeader>
        <CardContent className="min-h-[120px]" />
      </Card>
    </section>
  );
}
