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

const JOB_STATUS_STYLES: Record<string, string> = {
  pending:    "bg-bone/10 text-bone/50",
  analyzing:  "bg-ochre/15 text-ochre",
  prompting:  "bg-ochre/15 text-ochre",
  generating: "bg-ochre/15 text-ochre",
  assembling: "bg-ochre/15 text-ochre",
  complete:   "bg-forest/20 text-forest",
  failed:     "bg-oxblood/20 text-bone/70",
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
    supabase.from("video_jobs").select("id", { count: "exact", head: true }),
    supabase
      .from("assets")
      .select("id, title, kind, created_at")
      .order("created_at", { ascending: false })
      .limit(3)
      .returns<AssetRow[]>(),
    supabase
      .from("video_jobs")
      .select("id, status, created_at, assets(title)")
      .order("created_at", { ascending: false })
      .limit(3)
      .returns<JobRow[]>(),
  ]);

  const STATS = [
    { label: "Assets", value: assetCount ?? 0, href: "/portal/assets" },
    { label: "Video jobs", value: jobCount ?? 0, href: "/portal/videos" },
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
      href: "/portal/videos/new",
      label: "Request a video",
      description: "Turn an instrumental into a music video automatically.",
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
      <div className="mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-forest mb-3">
          Artist Portal
        </p>
        <h1 className="font-display font-bold text-bone text-[clamp(2rem,4vw,2.75rem)] leading-tight">
          Welcome back, {stageName}.
        </h1>
        <div className="mt-4 h-px w-16 bg-bone/20" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-10">
        {STATS.map(({ label, value, href }) => (
          <Link
            key={href}
            href={href}
            className="rounded-lg border border-bone/10 bg-bone/5 px-5 py-4 hover:border-bone/20 transition-colors"
          >
            <p className="font-display font-bold text-bone text-3xl">{value}</p>
            <p className="text-xs text-bone/40 mt-1 uppercase tracking-widest">{label}</p>
          </Link>
        ))}
      </div>

      {/* Action tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        {TILES.map(({ href, label, description, icon }) => (
          <Link
            key={href}
            href={href}
            className="rounded-lg border border-bone/10 bg-bone/5 p-5 hover:bg-bone/10 hover:border-ochre/30 transition-colors group flex flex-col gap-3"
          >
            <span className="text-bone/40 group-hover:text-ochre transition-colors">
              {icon}
            </span>
            <div>
              <p className="text-bone text-sm font-semibold group-hover:text-ochre transition-colors">
                {label}
              </p>
              <p className="text-bone/40 text-xs mt-0.5 leading-relaxed">{description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent assets */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-bone/30">
            Recent uploads
          </h2>
          <Link href="/portal/assets" className="text-xs text-ochre hover:text-ochre/70 transition-colors">
            View all →
          </Link>
        </div>
        {!recentAssets || recentAssets.length === 0 ? (
          <div className="rounded-lg border border-bone/10 p-6 text-center">
            <p className="text-bone/40 text-sm">No uploads yet.</p>
            <Link
              href="/portal/assets/new"
              className="mt-2 inline-block text-xs text-ochre hover:text-ochre/80 transition-colors"
            >
              Upload your first asset →
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-bone/10 overflow-hidden">
            {recentAssets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between px-4 py-3 border-b border-bone/5 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 px-2 py-0.5 rounded bg-bone/10 text-bone/40 text-[10px] uppercase tracking-wide">
                    {KIND_LABELS[asset.kind] ?? asset.kind}
                  </span>
                  <p className="text-sm text-bone/70 truncate">{asset.title}</p>
                </div>
                <p className="text-xs text-bone/25 shrink-0 ml-4">{formatDate(asset.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent video jobs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-bone/30">
            Video jobs
          </h2>
          <Link href="/portal/videos" className="text-xs text-ochre hover:text-ochre/70 transition-colors">
            View all →
          </Link>
        </div>
        {!recentJobs || recentJobs.length === 0 ? (
          <div className="rounded-lg border border-bone/10 p-6 text-center">
            <p className="text-bone/40 text-sm">No video jobs yet.</p>
            <Link
              href="/portal/videos/new"
              className="mt-2 inline-block text-xs text-ochre hover:text-ochre/80 transition-colors"
            >
              Request your first video →
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-bone/10 overflow-hidden">
            {recentJobs.map((job) => (
              <Link
                key={job.id}
                href={`/portal/videos/${job.id}`}
                className="flex items-center justify-between px-4 py-3 border-b border-bone/5 last:border-0 hover:bg-bone/5 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
                      JOB_STATUS_STYLES[job.status] ?? "bg-bone/10 text-bone/50"
                    }`}
                  >
                    {job.status}
                  </span>
                  <p className="text-sm text-bone/70 truncate">
                    {job.assets?.title ?? "—"}
                  </p>
                </div>
                <p className="text-xs text-bone/25 shrink-0 ml-4">{formatDate(job.created_at)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
