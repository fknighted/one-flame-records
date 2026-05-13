import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import ReleaseCard from "@/components/ReleaseCard";
import ReleasesFilter from "@/components/ReleasesFilter";
import type { Tables } from "@/types/supabase";

export const metadata = {
  title: "Releases",
  description: "Albums, EPs, and singles from the One Flame Records roster.",
};

type ReleaseRow = Tables<"releases"> & {
  artists: { stage_name: string; slug: string } | null;
};

type SearchParams = Promise<{ artist?: string; type?: string }>;

export default async function ReleasesPage({ searchParams }: { searchParams: SearchParams }) {
  const { artist, type } = await searchParams;
  const supabase = await createClient();

  // Artists for filter dropdown
  const { data: artists } = await supabase
    .from("artists")
    .select("id, stage_name")
    .eq("status", "active")
    .order("stage_name", { ascending: true });

  // Filtered releases
  let query = supabase
    .from("releases")
    .select("*, artists(stage_name, slug)")
    .order("release_date", { ascending: false });

  if (artist) query = query.eq("artist_id", artist);
  if (type)   query = query.eq("type", type);

  const { data: releases } = await query.returns<ReleaseRow[]>();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest mb-2">
          Discography
        </p>
        <h1 className="font-display font-bold text-oxblood text-[2.5rem] leading-[1.05] tracking-tight">
          Releases
        </h1>
        <div className="mt-3 h-px w-16 bg-oxblood" />
      </div>

      {/* Filters — Suspense boundary required by useSearchParams */}
      <div className="mb-8">
        <Suspense fallback={null}>
          <ReleasesFilter artists={artists ?? []} />
        </Suspense>
      </div>

      {/* Grid */}
      {releases && releases.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6">
          {releases.map((r) => (
            <ReleaseCard
              key={r.id}
              slug={r.slug}
              title={r.title}
              cover_url={r.cover_url}
              release_date={r.release_date}
              type={r.type}
              artist_name={r.artists?.stage_name ?? ""}
              artist_slug={r.artists?.slug ?? ""}
              streaming_links={(r.streaming_links as Record<string, string>) ?? {}}
            />
          ))}
        </div>
      ) : (
        <p className="text-ink/60">
          {artist || type ? "No releases match those filters." : "Releases coming soon."}
        </p>
      )}
    </div>
  );
}
