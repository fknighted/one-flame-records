import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { toggleJobPublic } from "./actions";
import type { Tables } from "@/types/supabase";
import YoutubeUploadButton from "@/components/YoutubeUploadButton";

type VideoJob = Tables<"video_jobs">;

type Props = { params: Promise<{ id: string }> };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_PILL: Record<string, string> = {
  pending:    "studio-chip studio-chip-neutral",
  processing: "studio-chip studio-chip-neutral",
  complete:   "studio-chip studio-chip-ok",
  failed:     "studio-chip studio-chip-bad",
};

export default async function AdminArtistVideosPage({ params }: Props) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: artist } = await supabase
    .from("artists")
    .select("id, stage_name")
    .eq("id", id)
    .single();

  if (!artist) notFound();

  const { data: jobs } = await supabase
    .from("video_jobs")
    .select("*")
    .eq("status", "complete")
    .eq("artist_id", id)
    .order("created_at", { ascending: false })
    .returns<VideoJob[]>();

  const rows = jobs ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href={`/admin/artists/${id}/edit`} className="studio-btn studio-btn-quiet studio-btn-sm">
          {artist.stage_name}
        </Link>
        <h1 className="studio-page-title mt-1">
          Saved Videos — {artist.stage_name}
        </h1>
      </div>

      {rows.length === 0 ? (
        <div className="studio-empty">
          <p className="studio-empty-body">No saved videos for this artist.</p>
        </div>
      ) : (
        <div className="studio-table-wrap">
          <table className="studio-table min-w-[640px]">
            <thead>
              <tr>
                <th>Style</th>
                <th>Status</th>
                <th>Created</th>
                <th>Completed</th>
                <th>Public</th>
                <th>YouTube</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((job) => {
                const params = (job.params && typeof job.params === "object") ? job.params as Record<string, string> : {};
                const toggleAction = toggleJobPublic.bind(null, job.id, artist.id);

                return (
                  <tr key={job.id}>
                    <td>
                      <span className="font-semibold">
                        {params.stylePreset ?? "—"}
                      </span>
                      {params.aspectRatio && (
                        <span className="block text-muted text-sm mt-0.5">
                          {params.aspectRatio}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`${STATUS_PILL[job.status] ?? "studio-chip studio-chip-neutral"} capitalize`}>
                        {job.status}
                      </span>
                      {job.error && (
                        <span
                          className="block text-muted text-sm mt-0.5 truncate max-w-[200px]"
                          title={job.error}
                        >
                          {job.error}
                        </span>
                      )}
                    </td>
                    <td className="text-sm text-muted">
                      {formatDate(job.created_at)}
                    </td>
                    <td className="text-sm text-muted">
                      {job.completed_at ? formatDate(job.completed_at) : "—"}
                    </td>
                    <td>
                      {job.status === "complete" ? (
                        <form action={toggleAction}>
                          <button
                            type="submit"
                            title={job.is_public ? "Click to make private" : "Click to make public"}
                            className={`studio-btn studio-btn-sm ${
                              job.is_public ? "studio-btn-secondary" : "studio-btn-quiet"
                            }`}
                          >
                            {job.is_public ? "Public" : "Private"}
                          </button>
                        </form>
                      ) : (
                        <span className="text-muted text-sm">—</span>
                      )}
                    </td>
                    <td>
                      {job.status === "complete" && (
                        <YoutubeUploadButton
                          source="video_job"
                          id={job.id}
                          youtubeId={(job as { youtube_id?: string | null }).youtube_id ?? null}
                          uploadStatus={(job as { youtube_upload_status?: string | null }).youtube_upload_status ?? null}
                        />
                      )}
                    </td>
                    <td className="is-num">
                      {job.status === "complete" && (
                        <a href={job.output_url ?? undefined} target="_blank" rel="noopener noreferrer" className="studio-link inline-flex items-center min-h-[44px]">Watch</a>
                      )}
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
