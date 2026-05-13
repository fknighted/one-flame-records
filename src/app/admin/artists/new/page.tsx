import ArtistForm from "@/components/ArtistForm";
import { createArtist } from "@/app/admin/artists/actions";

export default function NewArtistPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-bone">New Artist</h1>
      <ArtistForm action={createArtist} mode="create" />
    </div>
  );
}
