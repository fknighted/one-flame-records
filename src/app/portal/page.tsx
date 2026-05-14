import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";

type AssetRow = Pick<Tables<"assets">, "id" | "title" | "kind" | "created_at">;

const KIND_LABELS: Record<string, string> = {
  instrumental:     "Instrumental",
  demo:             "Demo",
  reference_video:  "Reference video",
  reference_image:  "Reference image",
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

  // Resolve stage name
  let stageName = "Artist";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("artist_id")
      .eq("id", user.id)
      .single();

    if (profile?.artist_id) {
      const { data: artist } = await supabase
        .from("artists")
        .select("stage_name")
        .eq("id", profile.artist_id)
        .single();
      if (artist?.stage_name) stageName = artist.stage_name;
    }
  }

  // Recent uploads — RLS scopes to current artist automatically
  const { data: recentAssets } = await supabase
    .from("assets")
    .select("id, title, kind, created_at")
    .order("created_at", { ascending: false })
    .limit(3)
    .returns<AssetRow[]>();

  const tiles = [
    {
      href: "/portal/profile",
      label: "Edit Profile",
      description: "Update your bio, photo, and streaming links.",
      active: true,
    },
    {
      href: "/portal/assets",
      label: "Upload an Asset",
      description: "Add instrumentals, demos, or reference clips.",
      active: true,
    },
    {
      href: "/portal/videos",
      label: "Request a Video",
      description: "Automated video generation — coming soon.",
      active: false,
    },
  ];

  return (
    <div className="max-w-3xl">
      {/* Welcome header */}
      <div className="mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest mb-2">
          Artist Portal
        </p>
        <h1 className="font-display font-bold text-bone text-3xl">
          Welcome back, {stageName}
        </h1>
        <div className="mt-3 h-px w-16 bg-bone/20" />
      </div>

      {/* Action tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {tiles.map(({ href, label, description, active }) =>
          active ? (
            <Link
              key={href}
              href={href}
              className="rounded-lg border border-bone/10 bg-bone/5 p-5 hover:bg-bone/10 hover:border-bone/20 transition-colors group"
            >
              <p className="text-bone font-semibold text-sm mb-1 group-hover:text-ochre transition-colors">
                {label}
              </p>
              <p className="text-bone/50 text-xs">{description}</p>
            </Link>
          ) : (
            <div
              key={href}
              className="rounded-lg border border-bone/5 bg-bone/3 p-5 opacity-50 cursor-not-allowed"
            >
              <p className="text-bone font-semibold text-sm mb-1">{label}</p>
              <p className="text-bone/50 text-xs">{description}</p>
            </div>
          )
        )}
      </div>

      {/* Recent uploads */}
      <div className="mb-10">
        <h2 className="text-xs text-bone/40 uppercase tracking-widest mb-3">
          Recent uploads
        </h2>
        {!recentAssets || recentAssets.length === 0 ? (
          <div className="rounded-lg border border-bone/10 bg-bone/5 p-6 text-center">
            <p className="text-bone/40 text-sm">No uploads yet.</p>
            <Link
              href="/portal/assets"
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
                  <span className="shrink-0 px-2 py-0.5 rounded bg-bone/10 text-bone/50 text-xs">
                    {KIND_LABELS[asset.kind] ?? asset.kind}
                  </span>
                  <p className="text-sm text-bone/80 truncate">{asset.title}</p>
                </div>
                <p className="text-xs text-bone/30 shrink-0 ml-4">
                  {formatDate(asset.created_at)}
                </p>
              </div>
            ))}
            <div className="px-4 py-2 border-t border-bone/5">
              <Link
                href="/portal/assets"
                className="text-xs text-ochre hover:text-ochre/80 transition-colors"
              >
                View all →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Video jobs — Phase 4 placeholder */}
      <div>
        <h2 className="text-xs text-bone/40 uppercase tracking-widest mb-3">
          Video jobs
        </h2>
        <div className="rounded-lg border border-bone/5 bg-bone/3 p-6 text-center opacity-50">
          <p className="text-bone/40 text-sm">Video automation coming in Phase 4.</p>
        </div>
      </div>
    </div>
  );
}
