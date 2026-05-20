import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import AdminAssetUploadForm from "@/components/AdminAssetUploadForm";
import { deleteAsset } from "./actions";
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href={`/admin/artists/${id}/edit`}
          className="text-xs text-bone/40 hover:text-ochre transition-colors"
        >
          ← {artist.stage_name}
        </Link>
        <h1 className="font-display text-2xl text-bone mt-1">
          Assets — {artist.stage_name}
        </h1>
      </div>

      {/* Asset list */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/40 mb-3">
          Library ({rows.length})
        </h2>
        {rows.length === 0 ? (
          <div className="border border-bone/10 rounded-lg p-8 text-center text-bone/30 text-sm">
            No assets yet. Upload the first one below.
          </div>
        ) : (
          <div className="border border-bone/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bone/10 bg-bone/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-bone/40 uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-bone/40 uppercase tracking-wider">Kind</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-bone/40 uppercase tracking-wider">Size</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-bone/40 uppercase tracking-wider">Duration</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-bone/40 uppercase tracking-wider">Uploaded</th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-bone/5">
                {rows.map((asset) => {
                  const deleteWithId = deleteAsset.bind(null, asset.id);
                  return (
                    <tr key={asset.id} className="hover:bg-bone/5 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-bone font-medium">{asset.title}</span>
                        {asset.notes && (
                          <span className="block text-bone/35 text-xs mt-0.5 truncate max-w-[240px]">
                            {asset.notes}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-bone/60">
                        {KIND_LABELS[asset.kind] ?? asset.kind}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-bone/60">
                        {formatBytes(asset.size_bytes)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-bone/60">
                        {formatDuration(asset.duration_seconds)}
                      </td>
                      <td className="px-4 py-3 text-xs text-bone/50">
                        {formatDate(asset.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <form action={deleteWithId}>
                          <button
                            type="submit"
                            className="text-xs text-bone/30 hover:text-red-400 transition-colors"
                            title="Delete asset"
                          >
                            ×
                          </button>
                        </form>
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
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/40 mb-4">
          Upload new asset
        </h2>
        <div className="border border-bone/10 rounded-lg p-6 max-w-lg">
          <AdminAssetUploadForm artistId={id} />
        </div>
      </div>
    </div>
  );
}
