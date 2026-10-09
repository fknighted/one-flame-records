import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import VideoEmbed from "@/components/VideoEmbed";
import VideosFilter from "@/components/VideosFilter";
import SectionHeader from "@/components/SectionHeader";
import EmptyState from "@/components/EmptyState";
import type { Tables } from "@/types/supabase";

export const metadata = {
  title: "Videos",
  description:
    "Music videos, live performances, and more from One Flame Records artists.",
};

type VideoRow = Tables<"videos"> & {
  artists: { stage_name: string } | null;
};

type VideoJobRow = Tables<"video_jobs"> & {
  artists: { stage_name: string } | null;
};

type SearchParams = Promise<{ artist?: string; kind?: string }>;

// This page renders dynamically (it reads searchParams), so we cache the
// searchParams-independent DB reads: the active-artist list, every video
// (videos RLS is USING true) and the public+complete generated jobs. artist/
// kind filtering happens in JS below. Signed URLs are minted per-request (see
// component) so they never outlive their 1h TTL.
const getVideosData = unstable_cache(
  async () => {
    const supabase = createServiceClient();
    const [{ data: artists }, { data: videos }, { data: publicJobs }] = await Promise.all([
      supabase
        .from("artists")
        .select("id, stage_name")
        .eq("status", "active")
        .order("stage_name", { ascending: true }),

      supabase
        .from("videos")
        .select("*, artists(stage_name)")
        .order("featured", { ascending: false })
        .order("published_at", { ascending: false })
        .returns<VideoRow[]>(),

      supabase
        .from("video_jobs")
        .select("*, artists(stage_name)")
        .eq("is_public", true)
        .eq("status", "complete")
        .order("completed_at", { ascending: false })
        .returns<VideoJobRow[]>(),
    ]);
    return {
      artists: artists ?? [],
      videos: videos ?? [],
      publicJobs: publicJobs ?? [],
    };
  },
  ["public-videos-page"],
  { revalidate: 120 }
);

export default async function VideosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { artist, kind } = await searchParams;

  const { artists, videos: allVideos, publicJobs } = await getVideosData();

  let videos = allVideos;
  if (artist) videos = videos.filter((v) => v.artist_id === artist);
  if (kind) videos = videos.filter((v) => v.kind === kind);

  // Sign generated-video URLs per-request (one round trip, not N) — kept out of
  // the cache so a signed URL never outlives its 1h TTL.
  const service = createServiceClient();
  const jobPaths = publicJobs.map((job) => `videos/${job.id}.mp4`);
  const { data: signedJobs } = jobPaths.length
    ? await service.storage.from("generated-videos").createSignedUrls(jobPaths, 3600)
    : { data: [] };
  const jobsWithUrls = publicJobs.map((job, i) => ({
    ...job,
    videoUrl: signedJobs?.[i]?.signedUrl ?? null,
  }));

  const isFiltered = !!(artist || kind);

  return (
    <>
      {/* ── Page banner ── */}
      <section className="bg-black">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 sm:pt-[88px] pb-2">
          <SectionHeader as="h1" title="Videos" />
        </div>
      </section>

      {/* ── Filter bar ── */}
      <section className="bg-black border-y border-line md:sticky md:top-[76px] z-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
          <Suspense fallback={null}>
            <VideosFilter artists={artists ?? []} />
          </Suspense>
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="bg-black">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px] space-y-14 sm:space-y-[88px]">
          {/* Music Videos */}
          <div>
            {jobsWithUrls.length > 0 && <SectionHeader title="Music Videos" />}
            {videos && videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-8">
                {videos.map((video, i) => (
                  <VideoEmbed
                    key={video.id}
                    youtube_id={video.youtube_id}
                    storage_url={video.storage_url}
                    title={video.title}
                    artist_name={video.artists?.stage_name ?? ""}
                    priority={i < 3}
                  />
                ))}
              </div>
            ) : isFiltered ? (
              <EmptyState
                title="No videos match."
                body="Try a different artist or kind."
                action={{ href: "/videos", label: "Clear filters" }}
              />
            ) : (
              <EmptyState
                title="No videos yet."
                body="The first ones are in the edit. Hear the roster while you wait."
                action={{ href: "/artists", label: "Hear the roster" }}
              />
            )}
          </div>

          {/* Generated Videos */}
          {jobsWithUrls.length > 0 && (
            <div>
              <SectionHeader title="Generated Videos" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-8">
                {jobsWithUrls.map((job) =>
                  job.videoUrl ? (
                    <div key={job.id} className="flex flex-col min-w-0">
                      <video
                        src={job.videoUrl}
                        controls
                        preload="metadata"
                        className="w-full aspect-video bg-panel focus-on-black"
                      />
                      <div className="mt-2.5 min-w-0">
                        <p className="type-title-sm text-paper line-clamp-2 [overflow-wrap:anywhere]">
                          {job.artists?.stage_name ?? ""}
                        </p>
                        {job.params && typeof job.params === "object" && "stylePreset" in job.params && (
                          <p className="mt-1 type-small text-muted [overflow-wrap:anywhere]">
                            {(job.params as Record<string, string>).stylePreset}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
