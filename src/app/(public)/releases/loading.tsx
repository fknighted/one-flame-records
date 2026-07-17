export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="h-8 w-40 rounded bg-ink/10 animate-pulse" />
      <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square rounded-lg bg-ink/10 animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-ink/10 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-ink/5 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
