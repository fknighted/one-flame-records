import ArtistForm from "@/components/ArtistForm";
import { createArtist } from "@/app/admin/artists/actions";

export default function NewArtistPage() {
  return (
    <div className="space-y-6">
      <h1 className="studio-page-title">New Artist</h1>
      <ArtistForm action={createArtist} mode="create" />
    </div>
  );
}
