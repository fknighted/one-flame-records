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

  return (
    <div>
      <h1 className="font-display text-2xl text-bone mb-6">Overview</h1>
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
