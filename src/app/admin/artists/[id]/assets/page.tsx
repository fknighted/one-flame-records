import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import AdminAssetUploadForm from "@/components/AdminAssetUploadForm";
import { deleteAsset, toggleAssetPublic } from "./actions";
import type { Tables } from "@/types/supabase";

type Asset = Tables<"assets">;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const KIND_LABELS: Record<string, string> = {
  instrumental:    "Instrumental",
  demo:            "Demo",
  reference_video: "Ref Video",
  reference_image: "Ref Image",
};

export default async function AdminArtistAssetsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: artist } = await supabase
    .from("artists")
    .select("id, stage_name")
    .eq("id", id)
    .single();

  if (!artist) notFound();

  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .eq("artist_id", id)
    .order("created_at", { ascending: false })
    .returns<Asset[]>();

  const rows = assets ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link href={`/admin/artists/${id}/edit`} className="studio-btn studio-btn-quiet studio-btn-sm">
            {artist.stage_name}
          </Link>
          <Link href={`/admin/artists/${id}/videos`} className="studio-btn studio-btn-quiet studio-btn-sm">
            Generated Videos
          </Link>
        </div>
        <h1 className="studio-page-title mt-1">
          Assets — {artist.stage_name}
        </h1>
      </div>

      {/* Asset list */}
      <div>
        <h2 className="studio-section-title mb-3">
          Library ({rows.length})
        </h2>
        {rows.length === 0 ? (
          <div className="studio-empty">
            <p className="studio-empty-body">No assets yet. Upload the first one below.</p>
          </div>
        ) : (
          <div className="studio-table-wrap">
            <table className="studio-table min-w-[560px]">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Kind</th>
                  <th>Size</th>
                  <th>Duration</th>
                  <th>Uploaded</th>
                  <th>Public</th>
                  <th><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((asset) => {
                  const deleteWithId = deleteAsset.bind(null, asset.id);
                  return (
                    <tr key={asset.id}>
                      <td>
                        <span className="font-semibold">{asset.title}</span>
                        {asset.notes && (
                          <span className="block text-muted text-sm mt-0.5 truncate max-w-[240px]">
                            {asset.notes}
                          </span>
                        )}
                      </td>
                      <td className="text-muted">
                        {KIND_LABELS[asset.kind] ?? asset.kind}
                      </td>
                      <td className="studio-figures text-muted">
                        {formatBytes(asset.size_bytes)}
                      </td>
                      <td className="studio-figures text-muted">
                        {formatDuration(asset.duration_seconds)}
                      </td>
                      <td className="text-sm text-muted">
                        {formatDate(asset.created_at)}
                      </td>
                      <td>
                        <form action={toggleAssetPublic.bind(null, asset.id)}>
                          <button
                            type="submit"
                            title={asset.is_public ? "Click to make private" : "Click to make public"}
                            className={`studio-btn studio-btn-sm ${
                              asset.is_public ? "studio-btn-secondary" : "studio-btn-quiet"
                            }`}
                          >
                            {asset.is_public ? "Public" : "Private"}
                          </button>
                        </form>
                      </td>
                      <td className="is-num">
                        <div className="flex items-center justify-end gap-3">
                          <form action={deleteWithId}>
                            <button
                              type="submit"
                              className="studio-btn studio-btn-danger studio-btn-sm"
                              title="Delete asset"
                              aria-label="Delete asset"
                            >
                              ×
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload form */}
      <div>
        <h2 className="studio-section-title mb-3">
          Upload new asset
        </h2>
        <div className="studio-card max-w-lg">
          <AdminAssetUploadForm artistId={id} />
        </div>
      </div>
    </div>
  );
}
