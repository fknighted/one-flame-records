import Link from "next/link";
import { notFound } from "next/navigation";
import ArtistForm from "@/components/ArtistForm";
import { updateArtist } from "@/app/admin/artists/actions";
import { createServiceClient } from "@/lib/supabase/server";

export default async function EditArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: artist, error } = await supabase
    .from("artists")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !artist) notFound();

  const initialValues = {
    id: artist.id,
    stage_name: artist.stage_name,
    slug: artist.slug,
    legal_name: artist.legal_name,
    bio: artist.bio,
    hometown: artist.hometown,
    genres: artist.genres,
    status: artist.status,
    featured_order: artist.featured_order,
    photo_url: artist.photo_url,
    socials: (artist.socials ?? {}) as Record<string, string>,
    streaming: (artist.streaming ?? {}) as Record<string, string>,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-bone">{artist.stage_name}</h1>
        <Link
          href={`/admin/artists/${id}/assets`}
          className="text-sm text-bone/40 hover:text-ochre transition-colors"
        >
          Assets →
        </Link>
      </div>
      <ArtistForm action={updateArtist} initialValues={initialValues} mode="edit" />
    </div>
  );
}
