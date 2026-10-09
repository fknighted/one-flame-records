import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import DeleteVideoButton from "./DeleteVideoButton";
import YoutubeUploadButton from "@/components/YoutubeUploadButton";

const KIND_LABELS: Record<string, string> = {
  official: "Official",
  lyric: "Lyric",
  live: "Live",
  bts: "Behind the Scenes",
  other: "Other",
};

export default async function AdminVideosPage() {
  const supabase = createServiceClient();
  const { data: videos, error } = await supabase
    .from("videos")
    .select(
      "id, title, youtube_id, storage_url, kind, featured, published_at, youtube_upload_status, artists(stage_name)"
    )
    .order("published_at", { ascending: false });

  if (error) throw new Error(`Failed to load videos: ${error.message}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="studio-page-title">Videos</h1>
        <Link
          href="/admin/videos/new"
          className="studio-btn studio-btn-primary"
        >
          Add Video
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="studio-empty">
          No videos yet.{" "}
          <Link href="/admin/videos/new" className="studio-link">
            Add the first one.
          </Link>
        </div>
      ) : (
        <div className="studio-table-wrap">
          <table className="studio-table min-w-[640px]">
            <thead>
              <tr>
                <th><span className="sr-only">Thumbnail</span></th>
                <th>
                  Title
                </th>
                <th>
                  Artist
                </th>
                <th>
                  Kind
                </th>
                <th>
                  Published
                </th>
                <th>
                  Featured
                </th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => {
                const artist = Array.isArray(video.artists)
                  ? video.artists[0]
                  : video.artists;
                return (
                  <tr key={video.id}>
                    <td>
                      {video.youtube_id ? (
                        <img
                          src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                          alt=""
                          className="w-16 h-10 object-cover"
                        />
                      ) : (
                        <div className="w-16 h-10 bg-raised flex items-center justify-center text-muted">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M4 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.414A2 2 0 0 0 21.414 7L17 2.586A2 2 0 0 0 15.586 2H6a2 2 0 0 0-2 2Zm10 7a1 1 0 0 1 1.447-.894l4 2a1 1 0 0 1 0 1.788l-4 2A1 1 0 0 1 14 15V11Z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="font-semibold">{video.title}</span>
                      <span className="block text-muted text-sm mt-0.5 studio-figures">
                        {video.youtube_id ?? "Uploaded"}
                      </span>
                    </td>
                    <td className="text-muted">
                      {artist?.stage_name ?? "—"}
                    </td>
                    <td className="text-muted">
                      {KIND_LABELS[video.kind] ?? video.kind}
                    </td>
                    <td className="text-muted">
                      {video.published_at?.slice(0, 10) ?? "—"}
                    </td>
                    <td>
                      {video.featured && (
                        <span className="studio-chip studio-chip-neutral">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="is-num whitespace-nowrap"><div className="flex flex-wrap items-center justify-end gap-2">
                      {video.youtube_id ? (
                        <a
                          href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="studio-btn studio-btn-secondary studio-btn-sm"
                        >
                          Watch
                        </a>
                      ) : video.storage_url ? (
                        <a
                          href={video.storage_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="studio-btn studio-btn-secondary studio-btn-sm"
                        >
                          Watch
                        </a>
                      ) : null}
                      {video.storage_url && (
                        <YoutubeUploadButton
                          source="video"
                          id={video.id}
                          youtubeId={video.youtube_id ?? null}
                          uploadStatus={(video as { youtube_upload_status?: string | null }).youtube_upload_status ?? null}
                        />
                      )}
                      <Link
                        href={`/admin/videos/${video.id}/edit`}
                        className="studio-btn studio-btn-secondary studio-btn-sm"
                      >
                        Edit
                      </Link>
                      <DeleteVideoButton id={video.id} title={video.title} />
                      </div>
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
