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
  pending:    "bg-bone/10 text-bone/60",
  processing: "bg-ochre/15 text-ochre",
  complete:   "bg-forest/20 text-sage",
  failed:     "bg-red-900/30 text-red-400",
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
    .eq("artist_id", id)
    .order("created_at", { ascending: false })
    .returns<VideoJob[]>();

  const rows = jobs ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href={`/admin/artists/${id}/edit`}
            className="text-xs text-bone/60 hover:text-ochre transition-colors"
          >
            ← {artist.stage_name}
          </Link>
          <h1 className="font-display text-2xl text-bone mt-1">
            Generated Videos — {artist.stage_name}
          </h1>
        </div>
        <Link
          href={`/admin/artists/${id}/videos/new`}
          className="rounded bg-oxblood px-4 py-2 text-sm font-medium text-bone hover:bg-oxblood/80 transition-colors"
        >
          + Request video
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="border border-bone/10 rounded-lg p-10 text-center text-bone/50 text-sm">
          No video jobs yet. Request one from an artist&apos;s asset.
        </div>
      ) : (
        <div className="border border-bone/10 rounded-lg overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-bone/10 bg-bone/5">
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/60 uppercase tracking-wider">Style</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/60 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/60 uppercase tracking-wider">Created</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/60 uppercase tracking-wider">Completed</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/60 uppercase tracking-wider">Public</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/60 uppercase tracking-wider">YouTube</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-bone/5">
              {rows.map((job) => {
                const params = (job.params && typeof job.params === "object") ? job.params as Record<string, string> : {};
                const toggleAction = toggleJobPublic.bind(null, job.id, artist.id);

                return (
                  <tr key={job.id} className="hover:bg-bone/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-bone font-medium">
                        {params.stylePreset ?? "—"}
                      </span>
                      {params.aspectRatio && (
                        <span className="block text-bone/52 text-xs mt-0.5">
                          {params.aspectRatio}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_PILL[job.status] ?? "bg-bone/10 text-bone/60"}`}>
                        {job.status}
                      </span>
                      {job.error && (
                        <span
                          className="block text-red-400/70 text-xs mt-0.5 truncate max-w-[200px]"
                          title={job.error}
                        >
                          {job.error}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-bone/50">
                      {formatDate(job.created_at)}
                    </td>
                    <td className="px-4 py-3 text-xs text-bone/50">
                      {job.completed_at ? formatDate(job.completed_at) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {job.status === "complete" ? (
                        <form action={toggleAction}>
                          <button
                            type="submit"
                            title={job.is_public ? "Click to make private" : "Click to make public"}
                            className={`text-xs font-medium px-2 py-0.5 rounded transition-colors ${
                              job.is_public
                                ? "bg-forest/20 text-sage hover:bg-forest/30"
                                : "bg-bone/10 text-bone/50 hover:bg-bone/20 hover:text-bone/60"
                            }`}
                          >
                            {job.is_public ? "Public" : "Private"}
                          </button>
                        </form>
                      ) : (
                        <span className="text-bone/52 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {job.status === "complete" && (
                        <YoutubeUploadButton
                          source="video_job"
                          id={job.id}
                          youtubeId={(job as { youtube_id?: string | null }).youtube_id ?? null}
                          uploadStatus={(job as { youtube_upload_status?: string | null }).youtube_upload_status ?? null}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {job.status === "complete" && (
                        <Link
                          href={`/admin/jobs?job=${job.id}`}
                          className="text-xs text-bone/50 hover:text-ochre transition-colors"
                        >
                          View →
                        </Link>
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
