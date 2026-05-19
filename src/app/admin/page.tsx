import { createServiceClient } from "@/lib/supabase/server";

async function getStats() {
  const supabase = createServiceClient();
  const [artists, releases, videos, applications] = await Promise.all([
    supabase.from("artists").select("id", { count: "exact", head: true }),
    supabase.from("releases").select("id", { count: "exact", head: true }),
    supabase.from("videos").select("id", { count: "exact", head: true }),
    supabase
      .from("signup_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);
  return {
    artists: artists.count ?? 0,
    releases: releases.count ?? 0,
    videos: videos.count ?? 0,
    pendingApplications: applications.count ?? 0,
  };
}

export default async function AdminOverviewPage() {
  const stats = await getStats();

  const cards = [
    { label: "Artists", value: stats.artists },
    { label: "Releases", value: stats.releases },
    { label: "Videos", value: stats.videos },
    { label: "Pending applications", value: stats.pendingApplications },
  ];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.oneflamerecords.com";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-bone">Overview</h1>
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-bone/40 hover:text-ochre transition-colors"
        >
          View public site
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 10L10 2M5 2h5v5" />
          </svg>
        </a>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-lg border border-bone/10 bg-bone/5 p-5"
          >
            <p className="text-sm text-bone/50">{label}</p>
            <p className="mt-1 text-3xl font-semibold text-bone">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
