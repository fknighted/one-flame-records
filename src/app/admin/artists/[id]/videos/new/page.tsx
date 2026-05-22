import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { AdminVideoRequestForm } from "@/components/AdminVideoRequestForm";
import { requestVideoAsAdmin } from "./actions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ asset_id?: string }>;
};

export default async function AdminRequestVideoPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { asset_id } = await searchParams;

  const supabase = createServiceClient();

  const { data: artist } = await supabase
    .from("artists")
    .select("id, stage_name")
    .eq("id", id)
    .single();

  if (!artist) notFound();

  // Fetch audio assets and reference images in parallel
  const [{ data: assets }, { data: refAssets }] = await Promise.all([
    supabase
      .from("assets")
      .select("id, title, duration_seconds")
      .eq("artist_id", id)
      .in("kind", ["instrumental", "demo"])
      .order("created_at", { ascending: false }),
    supabase
      .from("assets")
      .select("id, title, storage_path")
      .eq("artist_id", id)
      .eq("kind", "reference_image")
      .order("created_at", { ascending: false }),
  ]);

  // Generate short-lived signed URLs for reference image thumbnails
  const referenceImages = await Promise.all(
    (refAssets ?? []).map(async (asset) => {
      const { data: signed } = await supabase.storage
        .from("private-assets")
        .createSignedUrl(asset.storage_path, 1800);
      return { id: asset.id, title: asset.title, thumbUrl: signed?.signedUrl ?? null };
    })
  );

  const action = requestVideoAsAdmin.bind(null, id);

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/admin/artists/${id}/assets`}
          className="text-xs text-bone/40 hover:text-ochre transition-colors"
        >
          ← {artist.stage_name} — Assets
        </Link>
        <h1 className="font-display font-bold text-bone text-2xl mt-2">
          Request video
        </h1>
        <p className="text-bone/40 text-sm mt-1">
          for {artist.stage_name} · budget check bypassed
        </p>
        <div className="mt-3 h-px w-16 bg-bone/20" />
      </div>

      {assets && assets.length > 0 ? (
        <AdminVideoRequestForm
          assets={assets}
          defaultAssetId={asset_id}
          referenceImages={referenceImages}
          action={action}
        />
      ) : (
        <div className="rounded-lg border border-bone/10 p-10 text-center">
          <p className="text-bone/40 text-sm mb-4">
            No instrumentals or demos uploaded for this artist yet.
          </p>
          <Link
            href={`/admin/artists/${id}/assets`}
            className="inline-block rounded bg-ochre px-4 py-2 text-sm font-semibold text-ink hover:bg-ochre/90 transition-colors"
          >
            Upload an asset
          </Link>
        </div>
      )}
    </div>
  );
}
