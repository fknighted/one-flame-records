import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";

type VideoJob = Tables<"video_jobs"> & {
  assets: { title: string } | null;
};

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-bone/10 text-bone/50",
  analyzing:  "bg-forest/20 text-forest",
  prompting:  "bg-forest/20 text-forest",
  generating: "bg-forest/20 text-forest",
  assembling: "bg-ochre/20 text-ochre",
  complete:   "bg-forest/30 text-forest",
  failed:     "bg-oxblood/20 text-oxblood",
};

const STATUS_LABELS: Record<string, string> = {
  pending:    "Pending",
  analyzing:  "Analyzing audio",
  prompting:  "Writing scenes",
  generating: "Generating clips",
  assembling: "Assembling",
  complete:   "Ready",
  failed:     "Failed",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function PortalVideosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/portal/videos");

  const { data: profile } = await supabase
    .from("profiles")
    .select("artist_id")
    .eq("id", user.id)
    .single();

  if (!profile?.artist_id) {
    return (
      <div className="max-w-3xl">
        <h1 className="font-display text-2xl text-bone mb-4">Videos</h1>
        <p className="text-bone/50 text-sm">No artist profile linked. Contact the label.</p>
      </div>
    );
  }

  const { data: jobs } = await supabase
    .from("video_jobs")
    .select("*, assets(title)")
    .eq("artist_id", profile.artist_id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest mb-2">
            Artist Portal
          </p>
          <h1 className="font-display font-bold text-bone text-3xl">Videos</h1>
          <div className="mt-3 h-px w-16 bg-bone/20" />
        </div>
        <Link
          href="/portal/videos/new"
          className="mt-1 rounded bg-ochre px-4 py-2 text-sm font-semibold text-ink hover:bg-ochre/90 transition-colors"
        >
          Request video
        </Link>
      </div>

      {!jobs || jobs.length === 0 ? (
        <div className="rounded-lg border border-bone/10 p-10 text-center">
          <p className="text-bone/40 text-sm">No videos yet.</p>
          <Link
            href="/portal/videos/new"
            className="mt-4 inline-block rounded bg-ochre px-4 py-2 text-sm font-semibold text-ink hover:bg-ochre/90 transition-colors"
          >
            Request your first video
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-bone/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bone/10 bg-bone/5">
                <th className="text-left px-4 py-3 text-bone/40 font-medium text-xs uppercase tracking-wider">
                  Asset
                </th>
                <th className="text-left px-4 py-3 text-bone/40 font-medium text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-bone/40 font-medium text-xs uppercase tracking-wider">
                  Requested
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {(jobs as VideoJob[]).map((job, i) => (
                <tr
                  key={job.id}
                  className={`border-b border-bone/10 last:border-0 ${
                    i % 2 !== 0 ? "bg-bone/[0.02]" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-bone">
                    {job.assets?.title ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[job.status] ?? "bg-bone/10 text-bone/50"
                      }`}
                    >
                      {STATUS_LABELS[job.status] ?? job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-bone/50">
                    {formatDate(job.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {job.status === "complete" && job.output_url ? (
                      <a
                        href={job.output_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ochre hover:text-ochre/80 text-xs font-medium transition-colors"
                      >
                        Watch
                      </a>
                    ) : job.status === "failed" ? (
                      <span className="text-oxblood/60 text-xs">
                        {job.error ?? "Error"}
                      </span>
                    ) : (
                      <span className="text-bone/20 text-xs">In progress</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
