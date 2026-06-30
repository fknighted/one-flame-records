import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import VideoLibraryFilter from "@/components/VideoLibraryFilter";
import { JobsAutoRefresh } from "@/components/JobsAutoRefresh";
import { toggleVideoPublic } from "./actions";
import type { Tables } from "@/types/supabase";

type VideoJob = Tables<"video_jobs"> & {
  assets: { title: string; kind: string } | null;
};

type Params = { params?: unknown; searchParams: Promise<{ status?: string }> };

function displayStatus(status: string): "rendering" | "done" | "failed" {
  if (status === "complete") return "done";
  if (status === "failed") return "failed";
  return "rendering";
}

const STEP_LABELS: Record<string, string> = {
  pending:    "Waiting to start",
  analyzing:  "Analyzing audio",
  prompting:  "Writing scene prompts",
  generating: "Generating clips",
  assembling: "Assembling video",
  complete:   "Complete",
  failed:     "Failed",
};

// Ordered pipeline steps for the progress bar (excluding terminal states)
const PIPELINE_STEPS = ["analyzing", "prompting", "generating", "assembling"];

function PipelineProgress({ status }: { status: string }) {
  const current = PIPELINE_STEPS.indexOf(status);
  if (current === -1 && status !== "pending") return null;
  return (
    <div className="flex items-center gap-1.5 mt-2">
      {PIPELINE_STEPS.map((step, i) => {
        const done = current > i;
        const active = current === i;
        return (
          <div key={step} className="flex items-center gap-1.5">
            <div
              className={`h-1 rounded-full transition-all ${
                done
                  ? "w-6 bg-forest"
                  : active
                  ? "w-6 bg-ochre animate-pulse"
                  : "w-4 bg-bone/10"
              }`}
            />
          </div>
        );
      })}
      <span className="text-[11px] text-bone/40 ml-0.5">
        {STEP_LABELS[status] ?? "In progress"}
      </span>
    </div>
  );
}

function shortId(id: string) {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

function relativeDate(iso: string | null) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
}

export const metadata = { title: "Videos" };

export default async function PortalVideosPage({ searchParams }: Params) {
  const { status: statusFilter } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/portal/videos");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, artist_id")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const client = isAdmin ? createServiceClient() : supabase;

  const { data: allJobs } = await client
    .from("video_jobs")
    .select("*, assets(title, kind)")
    .order("created_at", { ascending: false })
    .returns<VideoJob[]>();

  const jobs = allJobs ?? [];
  const filtered = statusFilter
    ? jobs.filter((j) => displayStatus(j.status) === statusFilter)
    : jobs;

  const renderingCount = jobs.filter((j) => displayStatus(j.status) === "rendering").length;

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-3xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 pb-6 border-b border-bone/10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forest mb-2">
            Artist Portal
          </p>
          <h1 className="font-display font-bold text-bone text-3xl leading-none mb-3">
            Videos
          </h1>
          <p className="text-sm text-bone/50 leading-relaxed max-w-[48ch]">
            Upload an instrumental or demo, pick a visual style, and the studio renders a full music video automatically.
          </p>
        </div>
        <Link
          href="/portal/videos/new"
          className="shrink-0 mt-1 rounded px-4 py-2 bg-ochre text-ink text-sm font-semibold hover:bg-ochre/80 transition-colors"
        >
          + Request video
        </Link>
      </div>

      {/* Active indicator + auto-refresh */}
      <JobsAutoRefresh hasActiveJobs={renderingCount > 0} />
      {renderingCount > 0 && (
        <div className="flex items-center gap-2 mb-5 text-xs text-bone/50">
          <span className="w-1.5 h-1.5 rounded-full bg-ochre animate-pulse" />
          {renderingCount} job{renderingCount !== 1 ? "s" : ""} rendering — updates every 30s
        </div>
      )}

      {/* Filter row */}
      <div className="mb-5">
        <Suspense fallback={null}>
          <VideoLibraryFilter jobCount={filtered.length} />
        </Suspense>
      </div>

      {/* Job list */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-bone/10 p-12 text-center">
          <p className="text-sm text-bone/40 mb-4">
            {jobs.length === 0
              ? "No video jobs yet."
              : "No jobs match this filter."}
          </p>
          {jobs.length === 0 && (
            <Link
              href="/portal/videos/new"
              className="inline-block rounded bg-ochre px-4 py-2 text-sm font-semibold text-ink hover:bg-ochre/80 transition-colors"
            >
              Request your first video
            </Link>
          )}
          {jobs.length > 0 && statusFilter && (
            <Link href="/portal/videos" className="text-xs text-ochre hover:text-ochre/80 transition-colors">
              Show all →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((job) => {
            const ds = displayStatus(job.status);
            const assetTitle = job.assets?.title ?? "Untitled";
            const vid = shortId(job.id);
            const isRendering = ds === "rendering";
            const isDone = ds === "done";
            const isFailed = ds === "failed";

            return (
              <Link
                key={job.id}
                href={`/portal/videos/${job.id}`}
                className="flex items-start gap-4 p-4 rounded-lg border border-bone/10 hover:border-bone/25 hover:bg-bone/[0.03] transition-all group"
              >
                {/* Status indicator bar */}
                <div
                  className={`mt-1 w-1 self-stretch rounded-full shrink-0 ${
                    isDone ? "bg-forest/60" : isFailed ? "bg-oxblood/60" : "bg-ochre/40"
                  }`}
                />

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display font-bold text-bone text-base leading-snug truncate group-hover:text-ochre transition-colors">
                        {assetTitle}
                      </p>
                      <p className="font-mono text-[10px] text-bone/25 mt-0.5 uppercase tracking-widest">
                        VJ-{vid}
                      </p>
                    </div>

                    {/* Status badge */}
                    <span
                      className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                        isDone
                          ? "bg-forest/20 text-forest"
                          : isFailed
                          ? "bg-oxblood/20 text-oxblood"
                          : "bg-ochre/15 text-ochre"
                      }`}
                    >
                      {isDone ? "Done" : isFailed ? "Failed" : "Rendering"}
                    </span>
                  </div>

                  {/* Pipeline progress (only when rendering) */}
                  {isRendering && <PipelineProgress status={job.status} />}

                  {/* Done: date + actions */}
                  {isDone && (
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-bone/30">{relativeDate(job.completed_at)}</span>
                      <form action={toggleVideoPublic.bind(null, job.id)} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="submit"
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-colors ${
                            job.is_public
                              ? "bg-forest/20 text-forest hover:bg-forest/30"
                              : "bg-bone/10 text-bone/30 hover:bg-bone/20 hover:text-bone/60"
                          }`}
                        >
                          {job.is_public ? "Public" : "Private"}
                        </button>
                      </form>
                      {job.output_url && (
                        <span
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-medium text-ochre hover:text-ochre/80 transition-colors"
                        >
                          <a href={job.output_url} target="_blank" rel="noopener noreferrer">
                            Watch →
                          </a>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Failed: error message */}
                  {isFailed && job.error && (
                    <p className="mt-1.5 text-[11px] text-oxblood/80 leading-snug line-clamp-2">
                      {job.error}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Queue note */}
      <p className="mt-8 text-xs text-bone/25 leading-relaxed">
        Average render time is 12–20 minutes. Carlton reviews every job before it goes public — allow 24 hours after completion.
      </p>
    </div>
  );
}
