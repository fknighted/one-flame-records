import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import ReleaseCard from "@/components/ReleaseCard";
import ReleasesFilter from "@/components/ReleasesFilter";
import SectionHeader from "@/components/SectionHeader";
import EmptyState from "@/components/EmptyState";
import type { Tables } from "@/types/supabase";

export const metadata = {
  title: "Releases",
  description: "Albums, EPs, and singles from the One Flame Records roster.",
};

type ReleaseRow = Tables<"releases"> & {
  artists: { stage_name: string; slug: string } | null;
};

type SearchParams = Promise<{ artist?: string; type?: string; sort?: string }>;

// This page renders dynamically (it reads searchParams), so `revalidate` can't
// cache it. Instead we cache the searchParams-independent DB reads: the full
// active-artist list and every release (releases RLS is USING true, so the
// cookieless service client returns exactly the public set). Filtering and
// sorting happen in JS below, per request.
const getReleasesData = unstable_cache(
  async () => {
    const supabase = createServiceClient();
    const [{ data: artists }, { data: allReleases }] = await Promise.all([
      supabase
        .from("artists")
        .select("id, stage_name")
        .eq("status", "active")
        .order("stage_name", { ascending: true }),

      supabase
        .from("releases")
        .select("*, artists(stage_name, slug)")
        .returns<ReleaseRow[]>(),
    ]);
    return { artists: artists ?? [], allReleases: allReleases ?? [] };
  },
  ["public-releases-page"],
  { revalidate: 120 }
);

export default async function ReleasesPage({ searchParams }: { searchParams: SearchParams }) {
  const { artist, type, sort } = await searchParams;

  const { artists, allReleases } = await getReleasesData();

  // Filter
  let releases = allReleases ?? [];
  if (artist) releases = releases.filter((r) => r.artist_id === artist);
  if (type)   releases = releases.filter((r) => r.type === type);

  // Sort
  if (sort === "oldest") {
    releases = [...releases].sort(
      (a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
    );
  } else if (sort === "az") {
    releases = [...releases].sort((a, b) => a.title.localeCompare(b.title));
  } else {
    releases = [...releases].sort(
      (a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
    );
  }

  const totalCount = allReleases?.length ?? 0;
  const filteredCount = releases.length;
  const isFiltered = !!(artist || type);

  return (
    <>
      {/* ── Page banner ── */}
      <section className="bg-black">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 sm:pt-[88px] pb-2">
          <SectionHeader
            as="h1"
            title="Releases"
            action={
              <p className="type-small text-muted">
                {isFiltered
                  ? `${filteredCount} of ${totalCount}`
                  : `${totalCount} release${totalCount !== 1 ? "s" : ""}`}
              </p>
            }
          />
        </div>
      </section>

      {/* ── Filter bar ── */}
      <section className="bg-black border-y border-line md:sticky md:top-[76px] z-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
          <Suspense fallback={null}>
            <ReleasesFilter artists={artists ?? []} />
          </Suspense>
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="bg-black">
        <div className={`mx-auto max-w-6xl px-4 sm:px-6 py-14 ${releases.length > 0 ? "sm:py-[88px]" : ""}`}>
          {releases.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
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
          ) : isFiltered ? (
            <EmptyState
              title="No releases match."
              body="Try a different artist or type."
              action={{ href: "/releases", label: "Clear filters" }}
            />
          ) : (
            <EmptyState
              title="No releases yet."
              body="The first ones are in the studio. Get the drop in your inbox."
              action={{ href: "#subscribe", label: "Get release news" }}
            />
          )}
        </div>
      </section>
    </>
  );
}
