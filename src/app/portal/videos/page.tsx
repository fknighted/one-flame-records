import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import VideoLibraryFilter from "@/components/VideoLibraryFilter";
import type { Tables } from "@/types/supabase";

type VideoJob = Tables<"video_jobs"> & {
  assets: { title: string; kind: string } | null;
};

type Params = { params?: unknown; searchParams: Promise<{ status?: string }> };

// Maps Phase 4 pipeline statuses → 3-state display model
function displayStatus(status: string): "rendering" | "done" | "failed" {
  if (status === "complete") return "done";
  if (status === "failed") return "failed";
  return "rendering";
}

const STATUS_LABELS: Record<string, string> = {
  queued:     "Queued",
  analyzing:  "Analyzing audio…",
  prompting:  "Writing scenes…",
  generating: "Generating clips…",
  assembling: "Assembling…",
  complete:   "Complete",
  failed:     "Failed",
};

const DISPLAY_STATUS_CONFIG = {
  done:      { bgVar: "--color-status-done-bg",      fgVar: "--color-status-done-fg",      label: "Done" },
  rendering: { bgVar: "--color-status-rendering-bg", fgVar: "--color-status-rendering-fg", label: "Rendering" },
  failed:    { bgVar: "--color-status-failed-bg",    fgVar: "--color-status-failed-fg",    label: "Failed" },
};

function StatusPill({ status }: { status: string }) {
  const ds = displayStatus(status);
  const cfg = DISPLAY_STATUS_CONFIG[ds];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-[10px] py-1 rounded-sm text-[10px] font-bold uppercase tracking-[0.12em] whitespace-nowrap"
      style={{ backgroundColor: `var(${cfg.bgVar})`, color: `var(${cfg.fgVar})` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: `var(${cfg.fgVar})` }}
      />
      {cfg.label}
    </span>
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

// ── Video type button glyphs (inline SVGs, 1.75 stroke) ─────────────────────

function CanvasGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="16" height="16" rx="1" />
      <rect x="6" y="6" width="8" height="8" />
    </svg>
  );
}

function VisualizerGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="16" height="10" rx="1" />
      <path d="M5 10h2M8 8v4M11 9v2M14 7v6" />
    </svg>
  );
}

function LyricGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 6h8M6 10h6M6 14h4" />
    </svg>
  );
}

function LoopGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="10" cy="10" r="7" />
      <circle cx="10" cy="10" r="3" />
      <path d="M10 3v2M10 15v2M3 10h2M15 10h2" />
    </svg>
  );
}

const VIDEO_TYPES = [
  {
    type: "canvas",
    label: "Canvas",
    sub: "Spotify loop · 8s",
    Glyph: CanvasGlyph,
  },
  {
    type: "visualizer",
    label: "Visualizer",
    sub: "Waveform · full track",
    Glyph: VisualizerGlyph,
  },
  {
    type: "lyric",
    label: "Lyric video",
    sub: "Full lyrics · timed",
    Glyph: LyricGlyph,
  },
  {
    type: "loop",
    label: "Loop pack",
    sub: "3 × 15s clips",
    Glyph: LoopGlyph,
  },
] as const;

// ── Page ─────────────────────────────────────────────────────────────────────

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

  // Apply display-status filter
  const filtered = statusFilter
    ? jobs.filter((j) => displayStatus(j.status) === statusFilter)
    : jobs;

  const renderingCount = jobs.filter((j) => displayStatus(j.status) === "rendering").length;

  return (
    <div className="px-8 py-8">
      {/* ── Header ── */}
      <div className="flex items-end justify-between mb-8 pb-5 border-b border-bone/10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ochre mb-1">
            An automated rhythm room
          </p>
          <h1 className="font-display font-bold text-bone text-[2.5rem] leading-none tracking-[-0.018em]">
            Videos.
          </h1>
          <p className="mt-3 text-[13px] text-bone/50 max-w-[52ch] leading-relaxed">
            Generate official videos, visualizers, and Canvas loops from your release art and a stem mix. Carlton reviews every render before it leaves the studio.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/portal/videos/new"
            className="rounded px-4 py-2 bg-ochre text-ink text-sm font-semibold hover:bg-bone transition-colors"
          >
            + New video job
          </Link>
        </div>
      </div>

      {/* ── Start-a-job hero card ── */}
      <div
        className="relative rounded-lg border border-bone/10 p-8 mb-8 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(139,42,31,0.18) 0%, rgba(26,22,18,0.95) 60%)",
        }}
      >
        {/* Glow circle */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 w-80 h-80 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(184,137,59,0.20) 0%, transparent 70%)",
          }}
        />
        <div className="relative grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
          {/* Left */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ochre mb-2">
              Start a job
            </p>
            <h2 className="font-display font-bold text-bone text-[1.875rem] leading-[1.15] tracking-[-0.012em] mb-3">
              Generate a video<br />from a release.
            </h2>
            <p className="text-[13.5px] text-bone/70 leading-relaxed max-w-[44ch]">
              Pick a release, choose a video type, and the studio renders a draft within fifteen minutes. You'll be able to review and tweak before it ships.
            </p>
          </div>

          {/* Right — 2×2 video type buttons */}
          <div className="grid grid-cols-2 gap-3">
            {VIDEO_TYPES.map(({ type, label, sub, Glyph }) => (
              <Link
                key={type}
                href={`/portal/videos/new?type=${type}`}
                className="flex items-start gap-3 p-3.5 rounded-md border border-bone/10 bg-ink/65 hover:border-bone/30 transition-colors"
              >
                <div className="w-8 h-8 shrink-0 rounded-sm bg-ochre/20 flex items-center justify-center text-ochre">
                  <Glyph />
                </div>
                <div>
                  <p className="text-[13px] text-bone font-semibold leading-snug">{label}</p>
                  <p className="text-[11px] text-bone/50 leading-snug mt-0.5">{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter row ── */}
      <div className="py-3 border-t border-b border-bone/10 mb-0">
        <Suspense fallback={null}>
          <VideoLibraryFilter jobCount={filtered.length} />
        </Suspense>
      </div>

      {/* ── Column headers ── */}
      <div className="grid grid-cols-[100px_1fr_130px_1fr_110px_32px] gap-4 py-3 border-b border-bone/10">
        {["Thumb", "Job", "Status", "Progress", "Actions", ""].map((col) => (
          <span key={col} className="font-mono text-[10px] text-bone/30 uppercase tracking-[0.16em]">
            {col}
          </span>
        ))}
      </div>

      {/* ── Job rows ── */}
      {filtered.length === 0 ? (
        <div className="py-16 border border-bone/10 rounded-lg mt-4 text-center">
          <p className="text-[13px] text-bone/50">
            {jobs.length === 0
              ? "No video jobs yet. Pick a release above to start your first render."
              : "No jobs match this filter."}
          </p>
          {jobs.length > 0 && statusFilter && (
            <Link href="/portal/videos" className="mt-2 inline-block text-xs text-ochre hover:text-ochre/80 transition-colors">
              Show all →
            </Link>
          )}
        </div>
      ) : (
        <div>
          {filtered.map((job) => {
            const ds = displayStatus(job.status);
            const cfg = DISPLAY_STATUS_CONFIG[ds];
            const assetTitle = job.assets?.title ?? "Video job";
            const assetKind = job.assets?.kind ?? "";
            const vid = shortId(job.id);
            const inngestUrl = job.inngest_run_id
              ? `http://localhost:8288/runs/${job.inngest_run_id}`
              : null;

            return (
              <Link
                key={job.id}
                href={`/portal/videos/${job.id}`}
                className="grid grid-cols-[100px_1fr_130px_1fr_110px_32px] gap-4 py-3.5 border-b border-bone/10 items-center hover:bg-bone/5 transition-colors group"
              >
                {/* Thumbnail */}
                <div
                  className="w-[100px] h-[56px] shrink-0 rounded-sm flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: ds === "done"
                      ? "linear-gradient(135deg, rgba(63,90,58,0.4), rgba(26,22,18,0.9))"
                      : ds === "failed"
                      ? "linear-gradient(135deg, rgba(139,42,31,0.4), rgba(26,22,18,0.9))"
                      : "linear-gradient(135deg, rgba(184,137,59,0.25), rgba(26,22,18,0.9))",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(139,42,31,0.92)" }}
                  >
                    {/* Play triangle */}
                    <svg width="9" height="10" viewBox="0 0 9 10" fill="#F5EDD8" aria-hidden="true">
                      <path d="M0 0l9 5-9 5z" />
                    </svg>
                  </div>
                </div>

                {/* Title cell */}
                <div className="min-w-0">
                  <p className="font-mono text-[10px] text-bone/30 uppercase tracking-[0.10em] mb-0.5">
                    VJ-{vid} · {assetKind}
                  </p>
                  <p className="font-display font-bold text-bone text-base leading-snug tracking-[-0.005em] truncate group-hover:text-ochre transition-colors">
                    {assetTitle}
                  </p>
                </div>

                {/* Status pill */}
                <div>
                  <StatusPill status={job.status} />
                </div>

                {/* Progress / ETA */}
                <div className="min-w-0">
                  {ds === "rendering" && (
                    <p className="text-[11.5px] text-bone/50 truncate">
                      {STATUS_LABELS[job.status] ?? "In progress"}
                    </p>
                  )}
                  {ds === "done" && (
                    <p className="font-mono text-[11px] text-bone/30">
                      {relativeDate(job.completed_at)}
                    </p>
                  )}
                  {ds === "failed" && (
                    <p className="text-[11.5px] truncate" style={{ color: "var(--color-status-failed-fg)" }}>
                      {job.error ?? "An error occurred"}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div
                  className="flex items-center gap-3 justify-end"
                  onClick={(e) => e.preventDefault()}
                >
                  {ds === "done" && job.output_url && (
                    <a
                      href={job.output_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-ochre hover:text-ochre/80 transition-colors"
                    >
                      Watch →
                    </a>
                  )}
                  {ds === "failed" && inngestUrl && (
                    <a
                      href={inngestUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-ochre hover:text-ochre/80 transition-colors"
                    >
                      Logs →
                    </a>
                  )}
                  {ds === "rendering" && (
                    <span className="text-xs text-bone/30">In progress</span>
                  )}
                </div>

                {/* Kebab */}
                <span className="text-bone/30 text-sm text-right">⋯</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── About the queue callout ── */}
      <div
        className="mt-6 px-[18px] py-3.5 rounded-sm"
        style={{
          backgroundColor: "rgba(245,237,216,0.06)",
          borderLeft: "2px solid var(--color-ochre)",
        }}
      >
        <p className="text-[12.5px] text-bone/70 leading-[1.55]">
          <span className="text-ochre font-semibold">About the render queue:</span>{" "}
          Jobs run in order of submission. Average render time is 12 minutes. Carlton checks every job before delivery — expect a 24-hour review window before videos appear public on the site.
        </p>
      </div>

      {renderingCount > 0 && (
        <p className="mt-4 font-mono text-[11px] text-bone/30">
          {renderingCount} job{renderingCount !== 1 ? "s" : ""} currently rendering
        </p>
      )}
    </div>
  );
}
