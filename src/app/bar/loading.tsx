export default function Loading() {
  return (
    <div className="px-6 py-10 space-y-4 max-w-3xl">
      <div className="h-7 w-32 rounded bg-bone/10 animate-pulse" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-bone/5 border border-bone/10 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
