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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="studio-page-title">Releases</h1>
        <Link
          href="/admin/releases/new"
          className="studio-btn studio-btn-primary"
        >
          Add Release
        </Link>
      </div>

      {releases.length === 0 ? (
        <div className="studio-empty">
          No releases yet.{" "}
          <Link href="/admin/releases/new" className="studio-link inline-flex min-h-[44px] items-center">
            Add the first one.
          </Link>
        </div>
      ) : (
        <div className="studio-table-wrap">
          <table className="studio-table min-w-[640px]">
            <thead>
              <tr>
                <th><span className="sr-only">Cover</span></th>
                <th>
                  Title
                </th>
                <th>
                  Artist
                </th>
                <th>
                  Type
                </th>
                <th>
                  Date
                </th>
                <th>
                  Featured
                </th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {releases.map((release) => {
                const artist = Array.isArray(release.artists)
                  ? release.artists[0]
                  : release.artists;
                const deleteWithId = deleteRelease.bind(null, release.id);
                return (
                  <tr key={release.id}>
                    <td>
                      {release.cover_url ? (
                        <img
                          src={release.cover_url}
                          alt=""
                          className="w-9 h-9 object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 bg-raised" />
                      )}
                    </td>
                    <td>
                      <span className="font-semibold">{release.title}</span>
                      <span className="block text-muted text-sm mt-0.5">
                        /{release.slug}
                      </span>
                    </td>
                    <td className="text-muted">
                      {artist?.stage_name ?? "—"}
                    </td>
                    <td className="text-muted">
                      {TYPE_LABELS[release.type] ?? release.type}
                    </td>
                    <td className="text-muted">
                      {release.release_date}
                    </td>
                    <td>
                      {release.featured && (
                        <span className="studio-chip studio-chip-neutral">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="is-num">
                      <div className="flex items-center gap-3 justify-end">
                        <Link
                          href={`/admin/releases/${release.id}/edit`}
                          className="studio-btn studio-btn-secondary studio-btn-sm"
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
