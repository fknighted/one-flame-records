import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";

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
      "id, title, youtube_id, kind, featured, published_at, artists(stage_name)"
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
        <div className="border border-bone/10 rounded-lg p-12 text-center text-bone/30 text-sm">
          No videos yet.{" "}
          <Link href="/admin/videos/new" className="underline hover:text-bone/60">
            Add the first one.
          </Link>
        </div>
      ) : (
        <div className="border border-bone/10 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bone/10 bg-bone/5">
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/40 uppercase tracking-wider w-20" />
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/40 uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/40 uppercase tracking-wider">
                  Artist
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/40 uppercase tracking-wider">
                  Kind
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/40 uppercase tracking-wider">
                  Published
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/40 uppercase tracking-wider">
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
                      <img
                        src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                        alt=""
                        className="w-16 h-10 object-cover rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-bone font-medium">{video.title}</span>
                      <span className="block text-bone/35 text-xs mt-0.5 font-mono">
                        {video.youtube_id}
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
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/videos/${video.id}/edit`}
                        className="text-xs text-bone/40 hover:text-ochre transition-colors"
                      >
                        Edit
                      </Link>
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
