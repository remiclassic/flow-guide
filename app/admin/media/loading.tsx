export default function AdminMediaLoading() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-stone-200/80" />
        <div className="h-4 max-w-xl animate-pulse rounded-md bg-stone-200/50" />
      </div>
      <div className="h-24 animate-pulse rounded-[1.75rem] bg-stone-200/40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-[1.75rem] bg-stone-200/35"
          />
        ))}
      </div>
    </div>
  );
}
