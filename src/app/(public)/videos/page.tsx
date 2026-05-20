import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import VideoEmbed from "@/components/VideoEmbed";
import VideosFilter from "@/components/VideosFilter";
import type { Tables } from "@/types/supabase";

export const metadata = {
  title: "Videos",
  description:
    "Music videos, live performances, and more from One Flame Records artists.",
};

type VideoRow = Tables<"videos"> & {
  artists: { stage_name: string } | null;
};

type SearchParams = Promise<{ artist?: string; kind?: string }>;

export default async function VideosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { artist, kind } = await searchParams;
  const supabase = await createClient();

  const { data: artists } = await supabase
    .from("artists")
    .select("id, stage_name")
    .eq("status", "active")
    .order("stage_name", { ascending: true });

  let query = supabase
    .from("videos")
    .select("*, artists(stage_name)")
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false });

  if (artist) query = query.eq("artist_id", artist);
  if (kind) query = query.eq("kind", kind);

  const { data: videos } = await query.returns<VideoRow[]>();

  const isFiltered = !!(artist || kind);

  return (
    <>
      {/* ── Ink banner ── */}
      <section className="bg-ink">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-forest mb-4">
            Watch
          </p>
          <h1 className="font-display font-bold text-bone text-[clamp(2.5rem,5vw,4rem)] leading-[1.02] tracking-tight">
            Videos
          </h1>
          <div className="mt-4 h-px w-20 bg-oxblood" />
        </div>
      </section>

      {/* ── Sticky filter bar ── */}
      <section className="bg-cream border-b border-oxblood/10 sticky top-24 z-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
          <Suspense fallback={null}>
            <VideosFilter artists={artists ?? []} />
          </Suspense>
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          {videos && videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {videos.map((video, i) => (
                <VideoEmbed
                  key={video.id}
                  youtube_id={video.youtube_id}
                  title={video.title}
                  artist_name={video.artists?.stage_name ?? ""}
                  priority={i < 3}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-ink/40 text-sm">
                {isFiltered
                  ? "No videos match those filters."
                  : "Videos coming soon."}
              </p>
              {isFiltered && (
                <a
                  href="/videos"
                  className="mt-4 inline-block text-sm text-oxblood hover:underline"
                >
                  Clear filters
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
