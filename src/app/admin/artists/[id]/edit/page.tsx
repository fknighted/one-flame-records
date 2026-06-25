import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ArtistForm from "@/components/ArtistForm";
import { updateArtist } from "@/app/admin/artists/actions";
import { createServiceClient } from "@/lib/supabase/server";
import DeleteArtistButton from "@/app/admin/artists/DeleteArtistButton";

const STATUS_STYLES: Record<string, string> = {
  active:   "bg-forest/20 text-forest border border-forest/25",
  inactive: "bg-bone/10 text-bone/40 border border-bone/15",
  pending:  "bg-ochre/15 text-ochre border border-ochre/25",
};

export default async function EditArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const [{ data: artist, error }, { count: assetCount }, { count: jobCount }] = await Promise.all([
    supabase.from("artists").select("*").eq("id", id).single(),
    supabase.from("assets").select("id", { count: "exact", head: true }).eq("artist_id", id),
    supabase.from("video_jobs").select("id", { count: "exact", head: true }).eq("artist_id", id),
  ]);

  if (error || !artist) notFound();

  const genres = (artist.genres as string[] | null) ?? [];

  const initialValues = {
    id: artist.id,
    stage_name: artist.stage_name,
    slug: artist.slug,
    legal_name: artist.legal_name,
    bio: artist.bio,
    hometown: artist.hometown,
    genres: artist.genres as string[] | undefined,
    status: artist.status,
    featured_order: artist.featured_order,
    photo_url: artist.photo_url,
    socials: (artist.socials ?? {}) as Record<string, string>,
    streaming: (artist.streaming ?? {}) as Record<string, string>,
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Breadcrumb */}
      <Link
        href="/admin/artists"
        className="inline-flex items-center gap-1.5 text-xs text-bone/35 hover:text-bone/70 transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M19 12H5M5 12l7-7M5 12l7 7" />
        </svg>
        Artists
      </Link>

      {/* Artist identity header */}
      <div className="flex items-center gap-5">
        <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border border-bone/15 bg-ink">
          {artist.photo_url ? (
            <Image
              src={artist.photo_url}
              alt={artist.stage_name}
              fill
              className="object-cover object-top"
              sizes="64px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <svg viewBox="0 0 20 28" className="w-6 h-auto" aria-hidden="true">
                <path d="M10 1C10 1 4 9 4 16C4 19.8 6.3 23.1 10 25C13.7 23.1 16 19.8 16 16C16 9 10 1 10 1Z" fill="#8B2A1F" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-display font-bold text-bone text-2xl leading-tight">{artist.stage_name}</h1>
            <span className={`text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full border ${STATUS_STYLES[artist.status] ?? STATUS_STYLES.inactive}`}>
              {artist.status}
            </span>
          </div>
          {genres.length > 0 && (
            <p className="mt-0.5 text-xs text-bone/40">{genres.join(", ")}</p>
          )}
          <div className="mt-2 flex items-center gap-4 text-xs text-bone/35">
            <Link href={`/admin/artists/${id}/assets`} className="hover:text-ochre transition-colors">
              {assetCount ?? 0} assets →
            </Link>
            <Link href={`/admin/artists/${id}/videos`} className="hover:text-ochre transition-colors">
              {jobCount ?? 0} video jobs →
            </Link>
            <a
              href={`/artists/${artist.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ochre transition-colors"
            >
              Public profile ↗
            </a>
          </div>
        </div>
      </div>

      <div className="h-px bg-bone/10" />

      <ArtistForm action={updateArtist} initialValues={initialValues} mode="edit" />

      <div className="h-px bg-bone/10" />
      <div className="flex items-center justify-between">
        <p className="text-xs text-bone/30">Danger zone</p>
        <DeleteArtistButton id={artist.id} name={artist.stage_name} />
      </div>
    </div>
  );
}
