import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";

type AssetRow = Pick<Tables<"assets">, "id" | "title" | "kind" | "created_at">;
type JobRow = Pick<Tables<"video_jobs">, "id" | "status" | "created_at"> & {
  assets: { title: string } | null;
};

const KIND_LABELS: Record<string, string> = {
  instrumental:    "Instrumental",
  demo:            "Demo",
  reference_video: "Ref. video",
  reference_image: "Ref. image",
};

const JOB_STATUS_CHIPS: Record<string, string> = {
  pending:    "studio-chip-neutral",
  analyzing:  "studio-chip-neutral",
  prompting:  "studio-chip-neutral",
  generating: "studio-chip-neutral",
  assembling: "studio-chip-neutral",
  complete:   "studio-chip-ok",
  failed:     "studio-chip-bad",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function PortalDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let stageName = "Artist";
  let artistId: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("artist_id")
      .eq("id", user.id)
      .single();

    artistId = profile?.artist_id ?? null;

    if (artistId) {
      const { data: artist } = await supabase
        .from("artists")
        .select("stage_name")
        .eq("id", artistId)
        .single();
      if (artist?.stage_name) stageName = artist.stage_name;
    }
  }

  // Fetch stats + recent items in parallel — RLS scopes everything to this artist
  const [
    { count: assetCount },
    { count: jobCount },
    { data: recentAssets },
    { data: recentJobs },
  ] = await Promise.all([
    supabase.from("assets").select("id", { count: "exact", head: true }),
    supabase.from("video_jobs").select("id", { count: "exact", head: true }).eq("status", "complete"),
    supabase
      .from("assets")
      .select("id, title, kind, created_at")
      .order("created_at", { ascending: false })
      .limit(3)
      .returns<AssetRow[]>(),
    supabase
      .from("video_jobs")
      .select("id, status, created_at, assets(title)")
      .eq("status", "complete")
      .order("created_at", { ascending: false })
      .limit(3)
      .returns<JobRow[]>(),
  ]);

  const STATS = [
    { label: "Assets", value: assetCount ?? 0, href: "/portal/assets" },
    { label: "Saved videos", value: jobCount ?? 0, href: "/portal/videos" },
  ];

  const TILES = [
    {
      href: "/portal/assets/new",
      label: "Upload an asset",
      description: "Add instrumentals, demos, or reference clips.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
        </svg>
      ),
    },
    {
      href: "/portal/videos",
      label: "Video library",
      description: "Watch and manage your saved videos.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <polygon points="5,3 19,12 5,21" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      href: "/portal/profile",
      label: "Edit profile",
      description: "Update your bio, photo, and streaming links.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-3xl">
      {/* Welcome */}
      <div className="mb-8">
        <p className="studio-label mb-2">Artist Portal</p>
        <h1 className="studio-page-title">
          Welcome back, {stageName}.
        </h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {STATS.map(({ label, value, href }) => (
          <Link
            key={href}
            href={href}
            className="studio-stat studio-focus hover:bg-raised transition-colors"
          >
            <p className="studio-stat-label">{label}</p>
            <p className="studio-stat-value">{value}</p>
          </Link>
        ))}
      </div>

      {/* Action tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {TILES.map(({ href, label, description, icon }) => (
          <Link
            key={href}
            href={href}
            className="studio-card studio-focus hover:bg-raised transition-colors flex flex-col gap-3"
          >
            <span className="text-muted">
              {icon}
            </span>
            <div>
              <p className="text-paper text-[16px] font-bold">
                {label}
              </p>
              <p className="text-muted text-[14px] mt-0.5 leading-relaxed">{description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent assets */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-3">
          <h2 className="studio-label">
            Recent uploads
          </h2>
          <Link href="/portal/assets" className="studio-link text-[15px]">
            View all
          </Link>
        </div>
        {!recentAssets || recentAssets.length === 0 ? (
          <div className="studio-empty">
            <p className="studio-empty-title">No uploads yet.</p>
            <Link
              href="/portal/assets/new"
              className="studio-link text-[15px]"
            >
              Upload your first asset
            </Link>
          </div>
        ) : (
          <div className="studio-card p-0 divide-y divide-line">
            {recentAssets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="studio-chip studio-chip-neutral shrink-0">
                    {KIND_LABELS[asset.kind] ?? asset.kind}
                  </span>
                  <p className="text-[16px] text-paper truncate">{asset.title}</p>
                </div>
                <p className="text-[14px] text-muted shrink-0">{formatDate(asset.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent saved videos */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-3">
          <h2 className="studio-label">
            Saved videos
          </h2>
          <Link href="/portal/videos" className="studio-link text-[15px]">
            View all
          </Link>
        </div>
        {!recentJobs || recentJobs.length === 0 ? (
          <div className="studio-empty">
            <p className="studio-empty-title">No saved videos yet.</p>
          </div>
        ) : (
          <div className="studio-card p-0 divide-y divide-line">
            {recentJobs.map((job) => (
              <Link
                key={job.id}
                href={`/portal/videos/${job.id}`}
                className="studio-focus flex items-center justify-between gap-4 px-4 py-3 min-h-[44px] hover:bg-raised transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`studio-chip shrink-0 ${
                      JOB_STATUS_CHIPS[job.status] ?? "studio-chip-neutral"
                    }`}
                  >
                    {job.status}
                  </span>
                  <p className="text-[16px] text-paper truncate">
                    {job.assets?.title ?? "—"}
                  </p>
                </div>
                <p className="text-[14px] text-muted shrink-0">{formatDate(job.created_at)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
