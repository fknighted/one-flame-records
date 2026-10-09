export default function Loading() {
  return (
    <div className="px-4 sm:px-6 py-10 space-y-4 max-w-3xl">
      <div className="h-7 w-32 bg-raised" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 bg-panel border border-line" />
        ))}
      </div>
    </div>
  );
}
