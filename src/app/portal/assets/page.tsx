import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { toggleAssetPublic } from "./actions";
import type { Tables } from "@/types/supabase";

type AssetRow = Tables<"assets">;

const KIND_LABELS: Record<string, string> = {
  instrumental: "Instrumental",
  demo: "Demo",
  reference_video: "Ref. Video",
  reference_image: "Ref. Image",
};

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function PortalAssetsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/portal/assets");

  const { data: profile } = await supabase
    .from("profiles")
    .select("artist_id")
    .eq("id", user.id)
    .single();

  if (!profile?.artist_id) {
    return (
      <div className="max-w-3xl">
        <h1 className="studio-page-title mb-4">Assets</h1>
        <p className="text-[16px] text-muted">
          No artist profile linked. Contact the label.
        </p>
      </div>
    );
  }

  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .eq("artist_id", profile.artist_id)
    .order("created_at", { ascending: false });

  const serviceClient = createServiceClient();
  // Sign all asset URLs in a single request rather than one round trip each.
  const assetPaths = (assets ?? []).map((asset: AssetRow) => asset.storage_path);
  const { data: signedAssets } = assetPaths.length
    ? await serviceClient.storage.from("private-assets").createSignedUrls(assetPaths, 3600)
    : { data: [] };
  const assetsWithUrls = (assets ?? []).map((asset: AssetRow, i: number) => ({
    ...asset,
    signedUrl: signedAssets?.[i]?.signedUrl ?? null,
  }));

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="studio-label mb-2">Artist Portal</p>
          <h1 className="studio-page-title">Assets</h1>
        </div>
        <Link
          href="/portal/assets/new"
          className="studio-btn studio-btn-primary"
        >
          Upload
        </Link>
      </div>

      {assetsWithUrls.length === 0 ? (
        <div className="studio-empty">
          <p className="studio-empty-title">No assets uploaded yet.</p>
          <Link
            href="/portal/assets/new"
            className="studio-btn studio-btn-secondary mt-2"
          >
            Upload your first asset
          </Link>
        </div>
      ) : (
        <div className="studio-table-wrap">
          <table className="studio-table min-w-[640px]">
            <thead>
              <tr>
                <th>Kind</th>
                <th>Title</th>
                <th>Duration</th>
                <th>Uploaded</th>
                <th>Visibility</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {assetsWithUrls.map((asset) => (
                <React.Fragment key={asset.id}>
                  <tr>
                    <td>
                      <span className="studio-chip studio-chip-neutral">
                        {KIND_LABELS[asset.kind] ?? asset.kind}
                      </span>
                    </td>
                    <td className="[overflow-wrap:anywhere]">{asset.title}</td>
                    <td className="studio-figures text-muted">
                      {formatDuration(asset.duration_seconds)}
                    </td>
                    <td className="text-muted whitespace-nowrap">
                      {formatDate(asset.created_at)}
                    </td>
                    <td>
                      <form action={toggleAssetPublic.bind(null, asset.id)}>
                        <button
                          type="submit"
                          title={asset.is_public ? "Visible on your public page — click to hide" : "Click to show on your public page"}
                          className="studio-btn studio-btn-secondary studio-btn-sm"
                        >
                          {asset.is_public ? "Public" : "Private"}
                        </button>
                      </form>
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/portal/assets/${asset.id}/edit`}
                          className="studio-btn studio-btn-secondary studio-btn-sm"
                        >
                          Edit
                        </Link>
                        {asset.signedUrl ? (
                          <a
                            href={asset.signedUrl}
                            className="studio-btn studio-btn-secondary studio-btn-sm"
                            download
                          >
                            Download
                          </a>
                        ) : (
                          <span className="text-muted text-[14px]">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                  {asset.mime_type?.startsWith("audio/") && asset.signedUrl && (
                    <tr>
                      <td colSpan={6} className="pt-0">
                        <audio
                          src={asset.signedUrl}
                          controls
                          preload="none"
                          className="w-full h-10"
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
