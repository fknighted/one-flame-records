import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ArtistForm from "@/components/ArtistForm";
import { updateArtist } from "@/app/admin/artists/actions";
import { createServiceClient } from "@/lib/supabase/server";
import DeleteArtistButton from "@/app/admin/artists/DeleteArtistButton";

const STATUS_STYLES: Record<string, string> = {
  active:   "studio-chip studio-chip-ok",
  inactive: "studio-chip studio-chip-neutral",
  pending:  "studio-chip studio-chip-neutral",
};

export default async function EditArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const [{ data: artist, error }, { count: assetCount }, { count: videoCount }] = await Promise.all([
    supabase.from("artists").select("*").eq("id", id).single(),
    supabase.from("assets").select("id", { count: "exact", head: true }).eq("artist_id", id),
    supabase.from("video_jobs").select("id", { count: "exact", head: true }).eq("artist_id", id).eq("status", "complete"),
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
      <Link href="/admin/artists" className="studio-btn studio-btn-quiet studio-btn-sm">
        Artists
      </Link>

      {/* Artist identity header */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 overflow-hidden shrink-0 border border-line bg-raised">
          {artist.photo_url && (
            <Image
              src={artist.photo_url}
              alt={artist.stage_name}
              fill
              className="object-cover object-top"
              sizes="64px"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="studio-page-title">{artist.stage_name}</h1>
            <span className={`${STATUS_STYLES[artist.status] ?? STATUS_STYLES.inactive} capitalize`}>
              {artist.status}
            </span>
          </div>
          {genres.length > 0 && (
            <p className="mt-1 text-sm text-muted">{genres.join(", ")}</p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-x-4 text-sm">
            <Link href={`/admin/artists/${id}/assets`} className="studio-link inline-flex items-center min-h-[44px]">
              {assetCount ?? 0} assets
            </Link>
            <Link href={`/admin/artists/${id}/videos`} className="studio-link inline-flex items-center min-h-[44px]">
              {videoCount ?? 0} saved videos
            </Link>
            <a
              href={`/artists/${artist.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="studio-link inline-flex items-center min-h-[44px]"
            >
              Public profile
            </a>
          </div>
        </div>
      </div>

      <div className="studio-divider" />

      <ArtistForm action={updateArtist} initialValues={initialValues} mode="edit" />

      <div className="studio-divider" />
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted">Danger zone</p>
        <DeleteArtistButton id={artist.id} name={artist.stage_name} className="studio-btn studio-btn-danger studio-btn-sm" />
      </div>
    </div>
  );
}
