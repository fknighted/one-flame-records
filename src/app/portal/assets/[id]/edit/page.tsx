import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import EditAssetForm from "./EditAssetForm";
import DeleteAssetButton from "./DeleteAssetButton";

export default async function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionClient = await createClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) redirect("/login?next=/portal/assets");

  const { data: profile } = await sessionClient
    .from("profiles")
    .select("artist_id")
    .eq("id", user.id)
    .single();

  if (!profile?.artist_id) redirect("/portal/assets");

  const serviceClient = createServiceClient();
  const { data: asset } = await serviceClient
    .from("assets")
    .select("id, title, kind, notes")
    .eq("id", id)
    .eq("artist_id", profile.artist_id)
    .single();

  if (!asset) redirect("/portal/assets");

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <p className="studio-label mb-2">Artist Portal</p>
        <h1 className="studio-page-title">Edit Asset</h1>
      </div>
      <EditAssetForm asset={asset} />
      <div className="mt-8 pt-6 border-t border-line">
        <DeleteAssetButton assetId={asset.id} title={asset.title} />
      </div>
    </div>
  );
}
