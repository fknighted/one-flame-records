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
        <h1 className="font-display text-2xl text-bone mb-4">Assets</h1>
        <p className="text-bone/50 text-sm">
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
  const assetsWithUrls = await Promise.all(
    (assets ?? []).map(async (asset: AssetRow) => {
      const { data } = await serviceClient.storage
        .from("private-assets")
        .createSignedUrl(asset.storage_path, 3600);
      return { ...asset, signedUrl: data?.signedUrl ?? null };
    })
  );

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest mb-2">
            Artist Portal
          </p>
          <h1 className="font-display font-bold text-bone text-3xl">Assets</h1>
          <div className="mt-3 h-px w-16 bg-bone/20" />
        </div>
        <Link
          href="/portal/assets/new"
          className="mt-1 rounded bg-ochre px-4 py-2 text-sm font-semibold text-ink hover:bg-ochre/90 transition-colors"
        >
          Upload
        </Link>
      </div>

      {assetsWithUrls.length === 0 ? (
        <div className="rounded-lg border border-bone/10 p-10 text-center">
          <p className="text-bone/40 text-sm">No assets uploaded yet.</p>
          <Link
            href="/portal/assets/new"
            className="mt-4 inline-block rounded bg-ochre px-4 py-2 text-sm font-semibold text-ink hover:bg-ochre/90 transition-colors"
          >
            Upload your first asset
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-bone/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bone/10 bg-bone/5">
                <th className="text-left px-4 py-3 text-bone/40 font-medium text-xs uppercase tracking-wider">
                  Kind
                </th>
                <th className="text-left px-4 py-3 text-bone/40 font-medium text-xs uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-bone/40 font-medium text-xs uppercase tracking-wider">
                  Duration
                </th>
                <th className="text-left px-4 py-3 text-bone/40 font-medium text-xs uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="text-left px-4 py-3 text-bone/40 font-medium text-xs uppercase tracking-wider">
                  Visibility
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {assetsWithUrls.map((asset, i) => (
                <tr
                  key={asset.id}
                  className={`border-b border-bone/10 last:border-0 ${
                    i % 2 !== 0 ? "bg-bone/[0.02]" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-forest/20 text-forest text-xs px-2 py-0.5 font-medium">
                      {KIND_LABELS[asset.kind] ?? asset.kind}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-bone">{asset.title}</td>
                  <td className="px-4 py-3 text-bone/50 font-mono text-xs">
                    {formatDuration(asset.duration_seconds)}
                  </td>
                  <td className="px-4 py-3 text-bone/50">
                    {formatDate(asset.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleAssetPublic.bind(null, asset.id)}>
                      <button
                        type="submit"
                        title={asset.is_public ? "Visible on your public page — click to hide" : "Click to show on your public page"}
                        className={`text-xs font-medium px-2 py-0.5 rounded transition-colors ${
                          asset.is_public
                            ? "bg-forest/20 text-forest hover:bg-forest/30"
                            : "bg-bone/10 text-bone/30 hover:bg-bone/20 hover:text-bone/60"
                        }`}
                      >
                        {asset.is_public ? "Public" : "Private"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {asset.signedUrl ? (
                      <a
                        href={asset.signedUrl}
                        className="text-ochre hover:text-ochre/80 text-xs font-medium transition-colors"
                        download
                      >
                        Download
                      </a>
                    ) : (
                      <span className="text-bone/20 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
