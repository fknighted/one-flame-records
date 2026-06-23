import Link from "next/link";
import Image from "next/image";
import { createServiceClient } from "@/lib/supabase/server";
import { deleteArtist, activateArtist } from "./actions";

const STATUS_STYLES: Record<string, string> = {
  active:   "bg-forest/20 text-forest border border-forest/25",
  inactive: "bg-bone/10 text-bone/40 border border-bone/15",
  pending:  "bg-ochre/15 text-ochre border border-ochre/25",
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

  // Get asset + video counts for all artists in one shot
  const [{ data: assetCounts }, { data: jobCounts }] = await Promise.all([
    supabase
      .from("assets")
      .select("artist_id")
      .in("artist_id", (artists ?? []).map((a) => a.id)),
    supabase
      .from("video_jobs")
      .select("artist_id")
      .in("artist_id", (artists ?? []).map((a) => a.id)),
  ]);

  const assetMap: Record<string, number> = {};
  for (const row of assetCounts ?? []) {
    assetMap[row.artist_id] = (assetMap[row.artist_id] ?? 0) + 1;
  }
  const jobMap: Record<string, number> = {};
  for (const row of jobCounts ?? []) {
    jobMap[row.artist_id] = (jobMap[row.artist_id] ?? 0) + 1;
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
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forest mb-2">
            Catalog
          </p>
          <h1 className="font-display font-bold text-bone text-3xl">Artists</h1>
          <div className="mt-3 h-px w-16 bg-bone/20" />
        </div>
        <Link
          href="/admin/artists/new"
          className="shrink-0 bg-ochre text-ink text-sm font-medium px-4 py-2 rounded hover:bg-ochre/90 transition-colors"
        >
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
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium transition-colors border",
              filterStatus === value || (value === "all" && filterStatus === "all")
                ? "bg-bone/15 text-bone border-bone/25"
                : "text-bone/45 border-bone/10 hover:border-bone/20 hover:text-bone/70",
            ].join(" ")}
          >
            {label}
            <span className="opacity-60">{count}</span>
          </Link>
        ))}
      </div>

      {/* Artist grid */}
      {(artists ?? []).length === 0 ? (
        <div className="border border-bone/10 rounded-lg p-12 text-center text-bone/30 text-sm">
          {filterStatus === "all" ? (
            <>No artists yet. <Link href="/admin/artists/new" className="underline hover:text-bone/60">Add the first one.</Link></>
          ) : (
            <>No {filterStatus} artists. <Link href="/admin/artists" className="underline hover:text-bone/60">Clear filter.</Link></>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(artists ?? []).map((artist) => {
            const deleteWithId   = deleteArtist.bind(null, artist.id);
            const activateWithId = activateArtist.bind(null, artist.id);
            const genres = (artist.genres as string[] | null) ?? [];
            const assetCount = assetMap[artist.id] ?? 0;
            const jobCount   = jobMap[artist.id] ?? 0;

            return (
              <div
                key={artist.id}
                className="rounded-lg border border-bone/10 overflow-hidden hover:border-bone/20 transition-colors group"
              >
                {/* Photo strip */}
                <div className="relative h-36 bg-ink overflow-hidden">
                  {artist.photo_url ? (
                    <Image
                      src={artist.photo_url}
                      alt={artist.stage_name}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <svg viewBox="0 0 20 28" className="w-10 h-auto" aria-hidden="true">
                        <path d="M10 1C10 1 4 9 4 16C4 19.8 6.3 23.1 10 25C13.7 23.1 16 19.8 16 16C16 9 10 1 10 1Z" fill="#8B2A1F" />
                        <path d="M10 14C10 14 7.5 17.5 7.5 19.5C7.5 21.4 8.6 23 10 24C11.4 23 12.5 21.4 12.5 19.5C12.5 17.5 10 14 10 14Z" fill="#3F5A3A" />
                      </svg>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />

                  {/* Status + featured badge */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className={`text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full border ${STATUS_STYLES[artist.status] ?? STATUS_STYLES.inactive}`}>
                      {artist.status}
                    </span>
                    {artist.featured_order != null && (
                      <span className="text-[10px] text-ochre/80 bg-ink/60 border border-ochre/20 px-2 py-0.5 rounded-full">
                        Featured #{artist.featured_order}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2.5">
                  <div>
                    <p className="font-display font-bold text-bone text-lg leading-tight">{artist.stage_name}</p>
                    {artist.hometown && (
                      <p className="text-xs text-bone/40 mt-0.5">{artist.hometown}</p>
                    )}
                  </div>

                  {genres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {genres.slice(0, 4).map((g) => (
                        <span key={g} className="text-[10px] px-1.5 py-0.5 rounded bg-bone/8 border border-bone/10 text-bone/50 capitalize">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Counts */}
                  <div className="flex gap-4 text-xs text-bone/35">
                    <span>{assetCount} asset{assetCount !== 1 ? "s" : ""}</span>
                    <span>{jobCount} video job{jobCount !== 1 ? "s" : ""}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-1 border-t border-bone/8">
                    {artist.status === "pending" && (
                      <form action={activateWithId} className="inline">
                        <button type="submit" className="text-xs text-forest hover:text-forest/70 transition-colors">
                          Activate
                        </button>
                      </form>
                    )}
                    <Link href={`/admin/artists/${artist.id}/assets`} className="text-xs text-bone/40 hover:text-ochre transition-colors">
                      Assets
                    </Link>
                    <Link href={`/admin/artists/${artist.id}/edit`} className="text-xs text-bone/40 hover:text-ochre transition-colors">
                      Edit
                    </Link>
                    <a
                      href={`/artists/${artist.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-bone/30 hover:text-bone/60 transition-colors"
                      title="View public profile"
                    >
                      ↗
                    </a>
                    <form action={deleteWithId} className="inline ml-auto">
                      <button type="submit" className="text-xs text-bone/20 hover:text-red-400 transition-colors" title="Delete artist" onClick={(e) => { if (!confirm(`Delete artist "${artist.stage_name}"?`)) e.preventDefault(); }}>
                        ×
                      </button>
                    </form>
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
