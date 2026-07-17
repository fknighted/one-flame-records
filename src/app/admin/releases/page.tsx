import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { deleteRelease } from "./actions";
import DeleteReleaseButton from "./DeleteReleaseButton";

const TYPE_LABELS: Record<string, string> = {
  single: "Single",
  ep: "EP",
  album: "Album",
  mixtape: "Mixtape",
};

export default async function AdminReleasesPage() {
  const supabase = createServiceClient();
  const { data: releases, error } = await supabase
    .from("releases")
    .select("id, title, slug, type, release_date, featured, cover_url, artists(stage_name)")
    .order("release_date", { ascending: false });

  if (error) throw new Error(`Failed to load releases: ${error.message}`);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-bone">Releases</h1>
        <Link
          href="/admin/releases/new"
          className="bg-ochre text-ink text-sm font-medium px-4 py-2 rounded hover:bg-ochre/90 transition-colors"
        >
          Add Release
        </Link>
      </div>

      {releases.length === 0 ? (
        <div className="border border-bone/10 rounded-lg p-12 text-center text-bone/50 text-sm">
          No releases yet.{" "}
          <Link href="/admin/releases/new" className="underline hover:text-bone/60">
            Add the first one.
          </Link>
        </div>
      ) : (
        <div className="border border-bone/10 rounded-lg overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-bone/10 bg-bone/5">
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/60 uppercase tracking-wider w-12" />
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/60 uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/60 uppercase tracking-wider">
                  Artist
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/60 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/60 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/60 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-bone/5">
              {releases.map((release) => {
                const artist = Array.isArray(release.artists)
                  ? release.artists[0]
                  : release.artists;
                const deleteWithId = deleteRelease.bind(null, release.id);
                return (
                  <tr key={release.id} className="hover:bg-bone/5 transition-colors">
                    <td className="px-4 py-3">
                      {release.cover_url ? (
                        <img
                          src={release.cover_url}
                          alt=""
                          className="w-9 h-9 rounded object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded bg-bone/10" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-bone font-medium">{release.title}</span>
                      <span className="block text-bone/52 text-xs mt-0.5">
                        /{release.slug}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-bone/60">
                      {artist?.stage_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-bone/60">
                      {TYPE_LABELS[release.type] ?? release.type}
                    </td>
                    <td className="px-4 py-3 text-bone/60">
                      {release.release_date}
                    </td>
                    <td className="px-4 py-3">
                      {release.featured && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-ochre/20 text-ochre border border-ochre/30">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-3 justify-end">
                        <Link
                          href={`/admin/releases/${release.id}/edit`}
                          className="text-xs text-bone/60 hover:text-ochre transition-colors"
                        >
                          Edit
                        </Link>
                        <DeleteReleaseButton action={deleteWithId} title={release.title} />
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
