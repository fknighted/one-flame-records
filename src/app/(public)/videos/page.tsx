import { Suspense } from "react";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import VideoEmbed from "@/components/VideoEmbed";
import VideosFilter from "@/components/VideosFilter";
import SectionHeader from "@/components/SectionHeader";
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

export default async function VideosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { artist, kind } = await searchParams;
  const supabase = await createClient();
  const service = createServiceClient();

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

  const { data: publicJobs } = await service
    .from("video_jobs")
    .select("*, artists(stage_name)")
    .eq("is_public", true)
    .eq("status", "complete")
    .order("completed_at", { ascending: false })
    .returns<VideoJobRow[]>();

  const jobsWithUrls = await Promise.all(
    (publicJobs ?? []).map(async (job) => {
      const { data } = await service.storage
        .from("generated-videos")
        .createSignedUrl(`videos/${job.id}.mp4`, 3600);
      return { ...job, videoUrl: data?.signedUrl ?? null };
    })
  );

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
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 space-y-16">
          {/* Music Videos */}
          <div>
            {jobsWithUrls.length > 0 && <SectionHeader title="Music Videos" />}
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

          {/* Generated Videos */}
          {jobsWithUrls.length > 0 && (
            <div>
              <SectionHeader title="Generated Videos" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {jobsWithUrls.map((job) =>
                  job.videoUrl ? (
                    <div key={job.id} className="rounded-lg overflow-hidden border border-oxblood/10 bg-ink/5">
                      <video
                        src={job.videoUrl}
                        controls
                        preload="metadata"
                        className="w-full aspect-video bg-ink/20"
                      />
                      <div className="px-3 py-2">
                        <p className="text-ink font-medium text-sm truncate">
                          {job.artists?.stage_name ?? ""}
                        </p>
                        {job.params && typeof job.params === "object" && "stylePreset" in job.params && (
                          <p className="text-ink/40 text-xs mt-0.5 truncate">
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
