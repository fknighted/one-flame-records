export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px]" role="status" aria-label="Loading the roster">
      <div className="h-12 w-48 bg-raised animate-pulse" />
      <div className="mt-2 h-2 w-[72px] bg-red" />
      <div className="mt-8 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square bg-raised animate-pulse" />
        ))}
      </div>
    </div>
  );
}
