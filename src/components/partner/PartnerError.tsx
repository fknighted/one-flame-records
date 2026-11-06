'use client';
export default function PartnerError({reset}:{reset:()=>void}) {
  return <section className="mx-auto max-w-2xl space-y-4 p-6 py-12"><h2 className="font-poster text-3xl uppercase">This section could not load</h2><p>Please try again. If the problem continues, contact Flames Partner. No successful save is claimed by this message.</p><button onClick={reset} className="studio-btn studio-btn-primary">Try again</button></section>;
}
