import Link from "next/link";
import Image from "next/image";
import { createServiceClient } from "@/lib/supabase/server";
import { activateArtist } from "./actions";
import DeleteArtistButton from "./DeleteArtistButton";

const STATUS_STYLES: Record<string, string> = {
  active:   "studio-chip studio-chip-ok",
  inactive: "studio-chip studio-chip-neutral",
  pending:  "studio-chip studio-chip-neutral",
};

type SearchParams = Promise<{ status?: string }>;

export default async function AdminArtistsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status: filterStatus = "all" } = await searchParams;
  const supabase = createServiceClient();

  let query = supabase
    .from("artists")
    .select("id, stage_name, status, hometown, featured_order, photo_url, slug, genres, bio")
    .order("featured_order", { ascending: true, nullsFirst: false })
    .order("stage_name", { ascending: true });

  if (filterStatus !== "all") {
    query = query.eq("status", filterStatus);
  }

  const { data: artists, error } = await query;
  if (error) throw new Error(`Failed to load artists: ${error.message}`);

  // Get asset + video counts for all artists in one aggregated round-trip
  // (grouped in Postgres — see admin_artist_counts RPC).
  const { data: counts } = await supabase.rpc("admin_artist_counts", {
    p_artist_ids: (artists ?? []).map((a) => a.id),
  });

  const assetMap: Record<string, number> = {};
  const jobMap: Record<string, number> = {};
  for (const row of counts ?? []) {
    assetMap[row.artist_id] = row.asset_count;
    jobMap[row.artist_id] = row.job_count;
  }

  const total    = artists?.length ?? 0;
  const active   = artists?.filter((a) => a.status === "active").length ?? 0;
  const pending  = artists?.filter((a) => a.status === "pending").length ?? 0;

  const filters = [
    { value: "all",      label: "All",      count: total },
    { value: "active",   label: "Active",   count: active },
    { value: "pending",  label: "Pending",  count: pending },
    { value: "inactive", label: "Inactive", count: total - active - pending },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="studio-label mb-2">Catalog</p>
          <h1 className="studio-page-title">Artists</h1>
        </div>
        <Link href="/admin/artists/new" className="studio-btn studio-btn-primary shrink-0">
          + Add Artist
        </Link>
      </div>

      {/* Status filter chips */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(({ value, label, count }) => (
          <Link
            key={value}
            href={value === "all" ? "/admin/artists" : `/admin/artists?status=${value}`}
            className={[
              "studio-focus inline-flex items-center gap-1.5 min-h-[44px] px-4 text-sm font-semibold",
              filterStatus === value || (value === "all" && filterStatus === "all")
                ? "bg-raised text-paper border border-muted"
                : "text-muted border border-line hover:text-paper",
            ].join(" ")}
          >
            {label}
            <span>{count}</span>
          </Link>
        ))}
      </div>

      {/* Artist grid */}
      {(artists ?? []).length === 0 ? (
        <div className="studio-empty">
          {filterStatus === "all" ? (
            <>No artists yet. <Link href="/admin/artists/new" className="studio-link inline-flex min-h-[44px] items-center">Add the first one.</Link></>
          ) : (
            <>No {filterStatus} artists. <Link href="/admin/artists" className="studio-link inline-flex min-h-[44px] items-center">Clear filter.</Link></>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(artists ?? []).map((artist) => {
            const activateWithId = activateArtist.bind(null, artist.id);
            const genres = (artist.genres as string[] | null) ?? [];
            const assetCount = assetMap[artist.id] ?? 0;
            const jobCount   = jobMap[artist.id] ?? 0;

            return (
              <div
                key={artist.id}
                className="studio-card p-0 overflow-hidden"
              >
                {/* Photo strip */}
                <div className="relative h-36 bg-raised overflow-hidden">
                  {artist.photo_url && (
                    <Image
                      src={artist.photo_url}
                      alt={artist.stage_name}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  )}

                  {/* Status + featured badge */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                    <span className={`${STATUS_STYLES[artist.status] ?? STATUS_STYLES.inactive} bg-black capitalize`}>
                      {artist.status}
                    </span>
                    {artist.featured_order != null && (
                      <span className="studio-chip studio-chip-neutral bg-black">
                        Featured #{artist.featured_order}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <p className="studio-section-title [overflow-wrap:anywhere]">{artist.stage_name}</p>
                    {artist.hometown && (
                      <p className="text-sm text-muted mt-0.5">{artist.hometown}</p>
                    )}
                  </div>

                  {genres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {genres.slice(0, 4).map((g) => (
                        <span key={g} className="studio-chip studio-chip-neutral capitalize">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Counts */}
                  <div className="flex flex-wrap gap-x-4 text-sm text-muted">
                    <span>{assetCount} asset{assetCount !== 1 ? "s" : ""}</span>
                    <span>{jobCount} video job{jobCount !== 1 ? "s" : ""}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-line">
                    {artist.status === "pending" && (
                      <form action={activateWithId} className="inline">
                        <button type="submit" className="studio-btn studio-btn-secondary studio-btn-sm">
                          Activate
                        </button>
                      </form>
                    )}
                    <Link href={`/admin/artists/${artist.id}/assets`} className="studio-btn studio-btn-secondary studio-btn-sm">
                      Assets
                    </Link>
                    <Link href={`/admin/artists/${artist.id}/edit`} className="studio-btn studio-btn-secondary studio-btn-sm">
                      Edit
                    </Link>
                    <a
                      href={`/artists/${artist.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="studio-btn studio-btn-quiet studio-btn-sm"
                      title="View public profile"
                    >
                      Public page
                    </a>
                    <DeleteArtistButton
                      id={artist.id}
                      name={artist.stage_name}
                      className="studio-btn studio-btn-danger studio-btn-sm ml-auto"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
