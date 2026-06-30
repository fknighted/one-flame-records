import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import type { ClipResult } from "@/lib/video/types";

type Scene = { start: number; end: number; prompt: string; aspectRatio: string };
type JobParams = {
  generatedClips?: (ClipResult | null)[];
  scenes?: Scene[];
  stylePreset?: string;
  aspectRatio?: string;
  model?: string;
};

type Props = { params: Promise<{ id: string }> };

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-bone/10 text-bone/40",
  analyzing:  "bg-forest/20 text-forest",
  prompting:  "bg-forest/20 text-forest",
  generating: "bg-forest/20 text-forest",
  assembling: "bg-ochre/20 text-ochre",
  complete:   "bg-forest/30 text-forest",
  failed:     "bg-oxblood/20 text-oxblood",
};

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: job } = await supabase
    .from("video_jobs")
    .select("*, assets(title), artists(stage_name)")
    .eq("id", id)
    .single();

  if (!job) notFound();

  const jobParams = (job.params ?? {}) as JobParams;
  const clips = (jobParams.generatedClips ?? []).filter(Boolean) as ClipResult[];
  const scenes = jobParams.scenes ?? [];

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <Link
          href="/admin/jobs"
          className="text-xs text-bone/40 hover:text-bone/70 transition-colors"
        >
          ← Back to jobs
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <h1 className="font-display text-2xl text-bone">
            {(job.artists as { stage_name: string } | null)?.stage_name ?? "Unknown artist"}
          </h1>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              STATUS_STYLES[job.status] ?? "bg-bone/10 text-bone/40"
            }`}
          >
            {job.status}
          </span>
        </div>
        <p className="text-bone/50 text-sm mt-1">
          {(job.assets as { title: string } | null)?.title ?? "—"}
        </p>
        {jobParams.stylePreset && (
          <p className="text-bone/30 text-xs mt-1">{jobParams.stylePreset}</p>
        )}
      </div>

      {job.error && (
        <div className="rounded-lg border border-oxblood/30 bg-oxblood/10 px-4 py-3 text-sm text-oxblood">
          {job.error}
        </div>
      )}

      {clips.length > 0 ? (
        <section className="space-y-4">
          <h2 className="font-display text-lg text-bone">
            Generated clips ({clips.length})
          </h2>
          <p className="text-xs text-bone/40">
            Clip URLs are temporary — they expire within 24 hours of generation.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {clips.map((clip, i) => (
              <div key={i} className="rounded-lg border border-bone/10 overflow-hidden bg-bone/[0.02]">
                <video
                  src={clip.videoUrl}
                  controls
                  preload="metadata"
                  className="w-full aspect-video object-contain bg-black"
                />
                <div className="px-3 pt-2 pb-1 flex items-center justify-between text-xs text-bone/40">
                  <span>Clip {i + 1} · {clip.durationSeconds}s · {clip.model}</span>
                  <span>${clip.costEstimateUsd.toFixed(3)}</span>
                </div>
                {scenes[i] && (
                  <p className="px-3 pb-3 text-xs text-bone/50 leading-relaxed">
                    {scenes[i].prompt}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="rounded-lg border border-bone/10 p-8 text-center">
          <p className="text-bone/40 text-sm">
            {job.status === "pending" || job.status === "analyzing" || job.status === "prompting"
              ? "Clips haven't been generated yet."
              : "No clips saved for this job."}
          </p>
        </div>
      )}

      {job.status === "complete" && (job as { output_url: string | null }).output_url && (
        <div className="pt-4 border-t border-bone/10">
          <a
            href={(job as { output_url: string }).output_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-ochre text-ink text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-ochre/80 transition-colors"
          >
            Watch final video ↗
          </a>
        </div>
      )}
    </div>
  );
}
