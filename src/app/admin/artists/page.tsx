import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-forest/30 text-forest border border-forest/30",
  inactive: "bg-bone/10 text-bone/40 border border-bone/15",
  pending: "bg-ochre/20 text-ochre border border-ochre/30",
};

export default async function AdminArtistsPage() {
  const supabase = createServiceClient();
  const { data: artists, error } = await supabase
    .from("artists")
    .select(
      "id, stage_name, status, hometown, featured_order, photo_url, slug"
    )
    .order("featured_order", { ascending: true, nullsFirst: false })
    .order("stage_name", { ascending: true });

  if (error) throw new Error(`Failed to load artists: ${error.message}`);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-bone">Artists</h1>
        <Link
          href="/admin/artists/new"
          className="bg-ochre text-ink text-sm font-medium px-4 py-2 rounded hover:bg-ochre/90 transition-colors"
        >
          Add Artist
        </Link>
      </div>

      {artists.length === 0 ? (
        <div className="border border-bone/10 rounded-lg p-12 text-center text-bone/30 text-sm">
          No artists yet.{" "}
          <Link href="/admin/artists/new" className="underline hover:text-bone/60">
            Add the first one.
          </Link>
        </div>
      ) : (
        <div className="border border-bone/10 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bone/10 bg-bone/5">
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/40 uppercase tracking-wider w-12" />
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/40 uppercase tracking-wider">
                  Artist
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/40 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/40 uppercase tracking-wider">
                  Hometown
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-bone/40 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-bone/5">
              {artists.map((artist) => (
                <tr key={artist.id} className="hover:bg-bone/5 transition-colors">
                  <td className="px-4 py-3">
                    {artist.photo_url ? (
                      <img
                        src={artist.photo_url}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-bone/10" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-bone font-medium">
                      {artist.stage_name}
                    </span>
                    <span className="block text-bone/35 text-xs mt-0.5">
                      /{artist.slug}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs capitalize ${STATUS_STYLES[artist.status] ?? STATUS_STYLES.inactive}`}
                    >
                      {artist.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-bone/60">
                    {artist.hometown ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-bone/60">
                    {artist.featured_order ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/artists/${artist.id}/edit`}
                      className="text-xs text-bone/40 hover:text-ochre transition-colors"
                    >
                      Edit
                    </Link>
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
