import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";
import ShareToggle from "./ShareToggle";

type VideoJob = Tables<"video_jobs"> & {
  assets: { title: string; kind: string; size_bytes: number; duration_seconds: number | null } | null;
};

type Props = { params: Promise<{ job_id: string }> };

function displayStatus(status: string): "rendering" | "done" | "failed" {
  if (status === "complete") return "done";
  if (status === "failed") return "failed";
  return "rendering";
}

const PIPELINE_STEPS = [
  { key: "queued",     label: "Queued" },
  { key: "analyzing",  label: "Analyzing" },
  { key: "prompting",  label: "Prompting" },
  { key: "generating", label: "Generating" },
  { key: "assembling", label: "Assembling" },
  { key: "complete",   label: "Complete" },
] as const;

const STATUS_ORDER = PIPELINE_STEPS.map((s) => s.key);

function currentStepIndex(status: string): number {
  const idx = STATUS_ORDER.indexOf(status as (typeof STATUS_ORDER)[number]);
  return idx === -1 ? 0 : idx;
}

const STATUS_LABELS: Record<string, string> = {
  queued:     "Queued — waiting to start",
  analyzing:  "Analyzing audio…",
  prompting:  "Writing scene prompts…",
  generating: "Generating video clips…",
  assembling: "Assembling final video…",
  complete:   "Complete",
  failed:     "Failed",
};

function shortId(id: string) {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number | null) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatParams(params: unknown): Record<string, string> {
  if (!params || typeof params !== "object") return {};
  const p = params as Record<string, unknown>;
  const out: Record<string, string> = {};
  if (p.stylePreset) out["Visual style"] = String(p.stylePreset);
  if (p.aspectRatio) out["Format"] = String(p.aspectRatio);
  if (p.model) out["Model"] = String(p.model);
  return out;
}

export default async function VideoJobDetailPage({ params }: Props) {
  const { job_id } = await params;

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

  const { data: job } = await client
    .from("video_jobs")
    .select("*, assets(title, kind, size_bytes, duration_seconds)")
    .eq("id", job_id)
    .returns<VideoJob[]>()
    .single();

  if (!job) notFound();

  const ds = displayStatus(job.status);
  const vid = shortId(job.id);
  const stepIdx = currentStepIndex(job.status);
  const paramDetails = formatParams(job.params);
  const isDev = process.env.NODE_ENV === "development";
  const inngestUrl = job.inngest_run_id
    ? isDev
      ? `http://localhost:8288/runs/${job.inngest_run_id}`
      : `https://app.inngest.com/env/production/runs/${job.inngest_run_id}`
    : null;

  return (
    <div className="px-8 py-8 max-w-5xl">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center justify-between mb-6 font-mono text-[11px] text-bone/30 uppercase tracking-[0.14em]">
        <div className="flex items-center gap-2">
          <Link href="/portal/videos" className="hover:text-bone/60 transition-colors">
            ← Videos
          </Link>
          <span>/</span>
          <span className="text-bone">VJ-{vid}</span>
        </div>
        <span className="font-mono text-[11px] text-bone/30">
          {ds === "rendering" ? "Live render" : ds === "done" ? "Complete" : "Failed"} · {vid}
        </span>
      </div>

      {/* ── Title row ── */}
      <div className="flex items-end justify-between mb-8 pb-5 border-b border-bone/10">
        <div>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.22em] mb-1"
            style={{
              color: ds === "done"
                ? "var(--color-status-done-fg)"
                : ds === "failed"
                ? "var(--color-status-failed-fg)"
                : "var(--color-ochre)",
            }}
          >
            {ds === "rendering" ? `Rendering` : ds === "done" ? "Complete" : "Failed"}
          </p>
          <h1 className="font-display font-bold text-bone text-[2rem] leading-none tracking-[-0.018em]">
            {job.assets?.title ?? "Video job"}
          </h1>
        </div>
        {ds === "failed" && (
          <div className="flex items-center gap-3">
            {inngestUrl && (
              <a
                href={inngestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-bone/20 px-4 py-2 text-sm text-bone/70 hover:text-bone hover:border-bone/40 transition-colors"
              >
                View full log →
              </a>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        {/* ── Left column ── */}
        <div className="space-y-6">
          {/* Preview surface */}
          <div
            className="w-full aspect-video rounded-sm border border-bone/10 flex items-center justify-center relative overflow-hidden"
            style={{
              background: ds === "done"
                ? "linear-gradient(135deg, rgba(63,90,58,0.3), rgba(26,22,18,1))"
                : ds === "failed"
                ? "linear-gradient(135deg, rgba(139,42,31,0.3), rgba(26,22,18,1))"
                : "linear-gradient(135deg, rgba(184,137,59,0.15), rgba(26,22,18,1))",
            }}
          >
            {ds === "done" && job.output_url ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={job.output_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded bg-ochre px-6 py-3 text-sm font-semibold text-ink hover:bg-bone transition-colors"
                >
                  Watch video →
                </a>
                <a
                  href={job.output_url}
                  download={`${job.assets?.title ?? "video"}.mp4`}
                  className="inline-flex items-center gap-2 rounded border border-bone/30 px-6 py-3 text-sm font-semibold text-bone/80 hover:border-bone/60 hover:text-bone transition-colors"
                >
                  Download MP4 ↓
                </a>
              </div>
            ) : (
              <div className="text-center px-8">
                <p className="font-mono text-[10px] text-bone/30 uppercase tracking-[0.14em] mb-4">
                  PREVIEW · NOT FINAL · {vid}
                </p>
                <p className="text-[13px] text-bone/40">
                  {ds === "failed"
                    ? "Render failed — no preview available"
                    : `${STATUS_LABELS[job.status] ?? "Processing"}`}
                </p>
              </div>
            )}
          </div>

          {/* Pipeline steps */}
          <div className="border border-bone/10 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ochre">
                Render pipeline · step {Math.min(stepIdx + 1, PIPELINE_STEPS.length)} of {PIPELINE_STEPS.length}
              </p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {PIPELINE_STEPS.map((step, i) => {
                const isDone = i < stepIdx;
                const isActive = i === stepIdx && ds === "rendering";
                return (
                  <div key={step.key} className="flex flex-col gap-1.5">
                    <div
                      className="h-1 rounded-full w-full"
                      style={{
                        backgroundColor: isDone
                          ? "var(--color-status-done-fg)"
                          : isActive
                          ? "var(--color-ochre)"
                          : "rgba(245,237,216,0.10)",
                      }}
                    />
                    <span
                      className="text-[10px] leading-tight"
                      style={{
                        color: isDone
                          ? "var(--color-status-done-fg)"
                          : isActive
                          ? "var(--color-ochre)"
                          : "rgba(245,237,216,0.30)",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error details if failed */}
          {ds === "failed" && job.error && (
            <div
              className="p-4 rounded-sm"
              style={{
                backgroundColor: "rgba(139,42,31,0.12)",
                borderLeft: "2px solid var(--color-status-failed-fg)",
              }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-1.5" style={{ color: "var(--color-status-failed-fg)" }}>
                Error
              </p>
              <p className="text-[13px] text-bone/70 leading-relaxed">{job.error}</p>
              {inngestUrl && (
                <a
                  href={inngestUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-xs text-ochre hover:text-ochre/80 transition-colors"
                >
                  View Inngest logs →
                </a>
              )}
            </div>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">
          {/* Source asset */}
          <div className="border border-bone/10 rounded-lg p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-bone/40 mb-3">
              Source
            </p>
            <div className="flex items-start justify-between gap-2 py-2 border-b border-bone/10 last:border-0">
              <div className="min-w-0">
                <p className="text-[12.5px] text-bone truncate font-medium">
                  {job.assets?.title ?? "—"}
                </p>
                <p className="font-mono text-[10.5px] text-bone/30 mt-0.5">
                  {job.assets?.kind ?? "—"}
                  {job.assets?.size_bytes ? ` · ${formatBytes(job.assets.size_bytes)}` : ""}
                  {job.assets?.duration_seconds ? ` · ${formatDuration(job.assets.duration_seconds)}` : ""}
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ochre shrink-0">
                Primary
              </span>
            </div>
          </div>

          {/* Settings */}
          <div className="border border-bone/10 rounded-lg p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-bone/40 mb-3">
              Settings
            </p>
            <div className="space-y-2">
              {Object.entries(paramDetails).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between border-b border-bone/10 pb-2 last:border-0 last:pb-0">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-bone/50">
                    {key}
                  </span>
                  <span className="text-[12.5px] text-bone/70 text-right max-w-[170px] leading-snug">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Timestamps */}
          <div className="border border-bone/10 rounded-lg p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-bone/40 mb-3">
              Timeline
            </p>
            <div className="space-y-2">
              {[
                ["Submitted", job.created_at],
                ["Started", job.started_at],
                ["Completed", job.completed_at],
              ].map(([label, ts]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-bone/50">
                    {label}
                  </span>
                  <span className="font-mono text-[11px] text-bone/50">
                    {ts ? formatDate(ts as string) : "—"}
                  </span>
                </div>
              ))}
              {job.cost_estimate_usd != null && (
                <div className="flex items-center justify-between pt-2 border-t border-bone/10">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-bone/50">
                    Est. cost
                  </span>
                  <span className="font-mono text-[11px] text-bone/50">
                    ${job.cost_estimate_usd.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Share toggle — completed videos only */}
          {ds === "done" && (
            <div className="border border-bone/10 rounded-lg p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-bone/40 mb-3">
                Visibility
              </p>
              <ShareToggle jobId={job.id} isPublic={job.is_public ?? false} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
