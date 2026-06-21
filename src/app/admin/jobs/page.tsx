import { createServiceClient } from "@/lib/supabase/server";
import { deleteJob } from "./actions";
import { JobsAutoRefresh } from "@/components/JobsAutoRefresh";
import { JobActions } from "@/components/RetryButton";
import { ArtistPickerDropdown } from "@/components/ArtistPickerDropdown";

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-bone/10 text-bone/40",
  analyzing:  "bg-forest/20 text-forest",
  prompting:  "bg-forest/20 text-forest",
  generating: "bg-forest/20 text-forest",
  assembling: "bg-ochre/20 text-ochre",
  complete:   "bg-forest/30 text-forest",
  failed:     "bg-oxblood/20 text-oxblood",
};

const STATUS_LABELS: Record<string, string> = {
  pending:    "Pending",
  analyzing:  "Analyzing",
  prompting:  "Prompting",
  generating: "Generating",
  assembling: "Assembling",
  complete:   "Complete",
  failed:     "Failed",
};

const ACTIVE_STATUSES = ["pending", "analyzing", "prompting", "generating", "assembling"];

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(startIso: string | null, endIso: string | null): string {
  if (!startIso || !endIso) return "—";
  const seconds = Math.round(
    (new Date(endIso).getTime() - new Date(startIso).getTime()) / 1000
  );
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

type JobRow = {
  id: string;
  status: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  output_url: string | null;
  error: string | null;
  inngest_run_id: string | null;
  cost_estimate_usd: number | null;
  params: Record<string, unknown>;
  assets: { title: string } | null;
  artists: { stage_name: string } | null;
};

export default async function AdminJobsPage() {
  const supabase = createServiceClient();

  const [
    { data: jobs },
    { count: total },
    { count: active },
    { count: failed },
    { data: artists },
  ] = await Promise.all([
    supabase
      .from("video_jobs")
      .select("id, status, created_at, started_at, completed_at, output_url, error, inngest_run_id, cost_estimate_usd, params, assets(title), artists(stage_name)")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("video_jobs").select("id", { count: "exact", head: true }),
    supabase
      .from("video_jobs")
      .select("id", { count: "exact", head: true })
      .in("status", ACTIVE_STATUSES),
    supabase
      .from("video_jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "failed"),
    supabase
      .from("artists")
      .select("id, stage_name")
      .eq("status", "active")
      .order("stage_name"),
  ]);

  const stats = [
    { label: "Total jobs", value: total ?? 0 },
    { label: "In progress", value: active ?? 0 },
    { label: "Failed", value: failed ?? 0 },
    { label: "Complete", value: (total ?? 0) - (active ?? 0) - (failed ?? 0) - ((jobs?.filter(j => j.status === "pending").length) ?? 0) },
  ];

  const hasActiveJobs = (jobs as unknown as JobRow[])?.some((j) =>
    ACTIVE_STATUSES.includes(j.status)
  ) ?? false;

  return (
    <div className="max-w-5xl">
      <JobsAutoRefresh hasActiveJobs={hasActiveJobs} />

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest mb-2">
            Label Admin
          </p>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-bold text-bone text-3xl">Video jobs</h1>
            {hasActiveJobs && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-forest/20 text-forest text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
                Live
              </span>
            )}
          </div>
          <div className="mt-3 h-px w-16 bg-bone/20" />
        </div>
        <ArtistPickerDropdown artists={artists ?? []} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-bone/10 p-4">
            <p className="text-xs text-bone/40 uppercase tracking-wider mb-1">{label}</p>
            <p className="font-display text-2xl text-bone">{value}</p>
          </div>
        ))}
      </div>

      {/* Jobs table */}
      {!jobs || jobs.length === 0 ? (
        <div className="rounded-lg border border-bone/10 p-10 text-center">
          <p className="text-bone/40 text-sm">No video jobs yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-bone/10 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-bone/10 bg-bone/5">
                <th className="text-left px-4 py-3 text-bone/40 font-medium text-xs uppercase tracking-wider">Artist</th>
                <th className="text-left px-4 py-3 text-bone/40 font-medium text-xs uppercase tracking-wider">Asset</th>
                <th className="text-left px-4 py-3 text-bone/40 font-medium text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-bone/40 font-medium text-xs uppercase tracking-wider">Requested</th>
                <th className="text-left px-4 py-3 text-bone/40 font-medium text-xs uppercase tracking-wider">Cost</th>
                <th className="text-left px-4 py-3 text-bone/40 font-medium text-xs uppercase tracking-wider">Process time</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {(jobs as unknown as JobRow[]).map((job, i) => {
                const deleteWithId = deleteJob.bind(null, job.id);
                return (
                  <tr
                    key={job.id}
                    className={`border-b border-bone/10 last:border-0 ${
                      i % 2 !== 0 ? "bg-bone/[0.02]" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-bone">
                      {job.artists?.stage_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-bone/70 max-w-[180px] truncate">
                      {job.assets?.title ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          STATUS_STYLES[job.status] ?? "bg-bone/10 text-bone/40"
                        }`}
                      >
                        {STATUS_LABELS[job.status] ?? job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-bone/50 text-xs">
                      {formatDate(job.created_at)}
                    </td>
                    <td className="px-4 py-3 text-bone/50 font-mono text-xs">
                      {job.cost_estimate_usd != null
                        ? `$${Number(job.cost_estimate_usd).toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-bone/50 font-mono text-xs">
                      {formatDuration(job.started_at, job.completed_at)}
                    </td>
                    <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                      {job.status === "complete" && job.output_url && (
                        <a
                          href={job.output_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ochre hover:text-ochre/80 text-xs font-medium transition-colors"
                        >
                          Watch
                        </a>
                      )}
                      <JobActions jobId={job.id} status={job.status} errorText={job.error} />
                      {job.inngest_run_id && (
                        <a
                          href={`https://app.inngest.com/env/production/runs/${job.inngest_run_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-bone/30 hover:text-bone/60 text-xs transition-colors"
                        >
                          Logs ↗
                        </a>
                      )}
                      <form action={deleteWithId} className="inline">
                        <button
                          type="submit"
                          className="text-xs text-bone/30 hover:text-red-400 transition-colors"
                          title="Delete job"
                        >
                          ×
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
