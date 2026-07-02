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
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-bone">Videos</h1>
        <Link
          href="/admin/videos/new"
          className="bg-ochre text-ink text-sm font-medium px-4 py-2 rounded hover:bg-ochre/90 transition-colors"
        >
          Add Video
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="border border-bone/10 rounded-lg p-12 text-center text-bone/50 text-sm">
          No videos yet.{" "}
          <Link href="/admin/videos/new" className="underline hover:text-bone/60">
            Add the first one.
          </Link>
        </div>
      ) : (
        <div className="border border-bone/10 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-bone/10 bg-bone/5">
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/60 uppercase tracking-wider w-20" />
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/60 uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/60 uppercase tracking-wider">
                  Artist
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/60 uppercase tracking-wider">
                  Kind
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/60 uppercase tracking-wider">
                  Published
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/60 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-bone/5">
              {videos.map((video) => {
                const artist = Array.isArray(video.artists)
                  ? video.artists[0]
                  : video.artists;
                return (
                  <tr key={video.id} className="hover:bg-bone/5 transition-colors">
                    <td className="px-4 py-3">
                      {video.youtube_id ? (
                        <img
                          src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                          alt=""
                          className="w-16 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-10 rounded bg-bone/10 flex items-center justify-center text-bone/50">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M4 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.414A2 2 0 0 0 21.414 7L17 2.586A2 2 0 0 0 15.586 2H6a2 2 0 0 0-2 2Zm10 7a1 1 0 0 1 1.447-.894l4 2a1 1 0 0 1 0 1.788l-4 2A1 1 0 0 1 14 15V11Z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-bone font-medium">{video.title}</span>
                      <span className="block text-bone/52 text-xs mt-0.5 font-mono">
                        {video.youtube_id ?? "Uploaded"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-bone/60">
                      {artist?.stage_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-bone/60">
                      {KIND_LABELS[video.kind] ?? video.kind}
                    </td>
                    <td className="px-4 py-3 text-bone/60">
                      {video.published_at?.slice(0, 10) ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {video.featured && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-ochre/20 text-ochre border border-ochre/30">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                      {video.youtube_id ? (
                        <a
                          href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-ochre hover:text-ochre/70 transition-colors"
                        >
                          Watch ↗
                        </a>
                      ) : video.storage_url ? (
                        <a
                          href={video.storage_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-ochre hover:text-ochre/70 transition-colors"
                        >
                          Watch ↗
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
                        className="text-xs text-bone/60 hover:text-ochre transition-colors"
                      >
                        Edit
                      </Link>
                      <DeleteVideoButton id={video.id} title={video.title} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
