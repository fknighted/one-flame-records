import { redirect } from "next/navigation";

export default async function RetiredArtistVideoRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/artists/${id}/videos`);
}
