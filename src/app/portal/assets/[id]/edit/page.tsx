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
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest mb-2">
          Artist Portal
        </p>
        <h1 className="font-display font-bold text-bone text-3xl">Edit Asset</h1>
        <div className="mt-3 h-px w-16 bg-bone/20" />
      </div>
      <EditAssetForm asset={asset} />
      <div className="mt-8 pt-6 border-t border-bone/10">
        <DeleteAssetButton assetId={asset.id} title={asset.title} />
      </div>
    </div>
  );
}
