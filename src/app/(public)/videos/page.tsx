import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import VideoEmbed from "@/components/VideoEmbed";
import VideosFilter from "@/components/VideosFilter";
import type { Tables } from "@/types/supabase";

export const metadata = {
  title: "Videos — One Flame Records",
  description: "Music videos, live performances, and more from One Flame Records artists.",
};

type VideoRow = Tables<"videos"> & {
  artists: { stage_name: string } | null;
};

type SearchParams = Promise<{ artist?: string; kind?: string }>;

export default async function VideosPage({ searchParams }: { searchParams: SearchParams }) {
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
    // Featured first, then newest
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false });

  if (artist) query = query.eq("artist_id", artist);
  if (kind)   query = query.eq("kind", kind);

  const { data: videos } = await query.returns<VideoRow[]>();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ochre mb-2">
          Watch
        </p>
        <h1 className="font-display font-bold text-oxblood text-[2.5rem] leading-[1.05] tracking-tight">
          Videos
        </h1>
        <div className="mt-3 h-px w-16 bg-oxblood" />
      </div>

      <div className="mb-8">
        <Suspense fallback={null}>
          <VideosFilter artists={artists ?? []} />
        </Suspense>
      </div>

      {videos && videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {videos.map((video, i) => (
            <VideoEmbed
              key={video.id}
              youtube_id={video.youtube_id}
              title={video.title}
              artist_name={video.artists?.stage_name ?? ""}
              // Eagerly load thumbnails for the first three above the fold
              priority={i < 3}
            />
          ))}
        </div>
      ) : (
        <p className="text-ink/50">
          {artist || kind ? "No videos match those filters." : "Videos coming soon."}
        </p>
      )}
    </div>
  );
}
