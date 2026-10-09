export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px]" aria-busy="true">
      <div className="h-12 w-48 bg-raised" />
      <div className="mt-2 h-2 w-[72px] bg-red" />
      <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] bg-panel border border-line" />
        ))}
      </div>
    </div>
  );
}
