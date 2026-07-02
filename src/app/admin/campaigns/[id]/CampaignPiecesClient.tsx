"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { approvePiece, rejectPiece, regeneratePiece, publishApproved, triggerCampaignVideo } from "./actions";

type Piece = {
  id: string;
  platform: string;
  content_type: string;
  caption: string | null;
  hashtags: string[] | null;
  image_url: string | null;
  video_url: string | null;
  video_script: string | null;
  status: string;
  error: string | null;
  published_at: string | null;
};

const ALL_PLATFORMS = ["instagram", "facebook", "tiktok"] as const;

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-[#E1306C]/15 text-[#E1306C] border border-[#E1306C]/25",
  tiktok:    "bg-bone/10 text-bone border border-bone/20",
  facebook:  "bg-[#1877F2]/15 text-[#1877F2] border border-[#1877F2]/25",
  news:      "bg-forest/15 text-sage border border-forest/25",
};

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-bone/10 text-bone/60",
  generating: "bg-forest/20 text-sage animate-pulse",
  ready:      "bg-ochre/15 text-ochre",
  approved:   "bg-forest/25 text-sage",
  rejected:   "bg-oxblood/20 text-rose",
  publishing: "bg-ochre/20 text-ochre animate-pulse",
  published:  "bg-forest/30 text-sage",
  failed:     "bg-oxblood/20 text-rose",
};

const STATUS_LABEL: Record<string, string> = {
  pending:    "Pending",
  generating: "Generating…",
  ready:      "Ready",
  approved:   "Approved",
  rejected:   "Rejected",
  publishing: "Publishing…",
  published:  "Published",
  failed:     "Failed",
};

function PieceCard({
  piece,
  publishPlatforms,
  onPlatformsChange,
}: {
  piece: Piece;
  publishPlatforms: string[];
  onPlatformsChange: (platforms: string[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();
  const [generatingVideo, startVideoGen] = useTransition();
  const [videoError, setVideoError] = useState<string | null>(null);

  const canApprove  = piece.status === "ready";
  const canReject   = piece.status === "ready" || piece.status === "approved";
  const canRegen    = piece.status === "ready" || piece.status === "rejected" || piece.status === "failed";
  const showPlatformPicker = piece.status === "ready" || piece.status === "approved";
  const canGenerateVideo =
    piece.platform !== "news" &&
    piece.video_script !== null &&
    piece.video_url === null &&
    (piece.status === "ready" || piece.status === "approved");

  return (
    <div className={`rounded-lg border overflow-hidden transition-colors ${
      piece.status === "approved" ? "border-forest/30 bg-forest/[0.03]" :
      piece.status === "rejected" ? "border-oxblood/20 opacity-60" :
      piece.status === "published" ? "border-forest/20 opacity-70" :
      "border-bone/10 hover:border-bone/20"
    }`}>
      {/* Video (generated) */}
      {piece.video_url && piece.platform !== "news" && (
        <div className="relative aspect-video overflow-hidden bg-ink">
          <video src={piece.video_url} controls preload="metadata" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Image */}
      {!piece.video_url && piece.image_url && (
        <div className="relative aspect-square overflow-hidden bg-ink">
          <Image src={piece.image_url} alt="" fill className="object-cover" unoptimized sizes="300px" />
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${PLATFORM_COLORS[piece.platform] ?? "bg-bone/10 text-bone/50"}`}>
            {piece.platform}
          </span>
          <span className="text-[10px] text-bone/52 uppercase tracking-wider">
            {piece.content_type.replace("_", " ")}
          </span>
          <span className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[piece.status] ?? "bg-bone/10 text-bone/60"}`}>
            {STATUS_LABEL[piece.status] ?? piece.status}
          </span>
        </div>

        {/* News piece: title + article preview */}
        {piece.platform === "news" ? (
          <div className="space-y-2">
            {piece.caption && (
              <p className="text-sm font-semibold text-bone leading-snug">{piece.caption}</p>
            )}
            {piece.video_script && (
              <div>
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs text-bone/60 hover:text-ochre transition-colors"
                >
                  {expanded ? "Hide article ↑" : "Preview article ↓"}
                </button>
                {expanded && (
                  <pre className="mt-2 text-xs text-bone/60 leading-relaxed whitespace-pre-wrap font-sans bg-bone/5 rounded p-3 max-h-48 overflow-y-auto">
                    {piece.video_script}
                  </pre>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Caption */}
            {piece.caption && (
              <p className="text-sm text-bone/70 leading-relaxed line-clamp-3">{piece.caption}</p>
            )}

            {/* Hashtags */}
            {(piece.hashtags ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {(piece.hashtags ?? []).map((h) => (
                  <span key={h} className="text-[11px] text-ochre/60">#{h}</span>
                ))}
              </div>
            )}

            {/* Video script toggle */}
            {piece.video_script && (
              <div>
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs text-bone/60 hover:text-ochre transition-colors"
                >
                  {expanded ? "Hide script ↑" : "View script ↓"}
                </button>
                {expanded && (
                  <pre className="mt-2 text-xs text-bone/60 leading-relaxed whitespace-pre-wrap font-sans bg-bone/5 rounded p-3">
                    {piece.video_script}
                  </pre>
                )}
              </div>
            )}
          </>
        )}

        {/* Error */}
        {piece.error && (
          <p className="text-xs text-rose bg-oxblood/10 rounded p-2">{piece.error}</p>
        )}

        {/* Published timestamp */}
        {piece.published_at && (
          <p className="text-[11px] text-bone/50">
            Published {new Date(piece.published_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        )}

        {/* Platform picker — social pieces only */}
        {showPlatformPicker && piece.platform !== "news" && (
          <div className="pt-2 border-t border-bone/8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-bone/52 mb-1.5">Post to</p>
            <div className="flex gap-3 flex-wrap">
              {ALL_PLATFORMS.map((p) => (
                <label key={p} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publishPlatforms.includes(p)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...publishPlatforms, p]
                        : publishPlatforms.filter((x) => x !== p);
                      onPlatformsChange(next);
                    }}
                    className="w-3.5 h-3.5 rounded accent-ochre"
                  />
                  <span className="text-xs text-bone/60 capitalize">{p}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Generate Video button */}
        {canGenerateVideo && (
          <div className="pt-2 border-t border-bone/8">
            <button
              type="button"
              disabled={generatingVideo}
              onClick={() => {
                setVideoError(null);
                startVideoGen(async () => {
                  try {
                    await triggerCampaignVideo(piece.id);
                  } catch (err) {
                    setVideoError(err instanceof Error ? err.message : "Failed to queue video generation.");
                  }
                });
              }}
              className="w-full text-xs px-3 py-2 rounded bg-ochre/15 text-ochre hover:bg-ochre/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {generatingVideo ? "Queuing…" : "⚡ Generate Video from Script"}
            </button>
            {videoError && (
              <p className="mt-1.5 text-xs text-rose">{videoError}</p>
            )}
          </div>
        )}

        {/* Actions */}
        {(canApprove || canReject || canRegen) && (
          <div className="flex gap-2 pt-1 border-t border-bone/8">
            {canApprove && (
              <form action={() => { startTransition(() => approvePiece(piece.id)); }}>
                <button type="submit" disabled={pending} className="text-xs px-3 py-1.5 rounded bg-forest/20 text-sage hover:bg-forest/30 disabled:opacity-50 transition-colors">
                  ✓ Approve
                </button>
              </form>
            )}
            {canReject && (
              <form action={() => { startTransition(() => rejectPiece(piece.id)); }}>
                <button type="submit" disabled={pending} className="text-xs px-3 py-1.5 rounded bg-bone/10 text-bone/50 hover:bg-oxblood/20 hover:text-rose disabled:opacity-50 transition-colors">
                  Reject
                </button>
              </form>
            )}
            {canRegen && (
              <form action={() => { startTransition(() => regeneratePiece(piece.id)); }}>
                <button type="submit" disabled={pending} className="text-xs text-bone/50 hover:text-ochre transition-colors ml-auto">
                  ↻ Regen
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CampaignPiecesClient({
  campaignId,
  pieces,
}: {
  campaignId: string;
  pieces: Piece[];
}) {
  const [publishResult, setPublishResult] = useState<{ published: number; skipped: number; errors: string[] } | null>(null);
  const [publishing, startPublishing] = useTransition();

  // platform overrides: pieceId → string[]. defaults to each piece's native platform.
  const [platformOverrides, setPlatformOverrides] = useState<Record<string, string[]>>(
    () => Object.fromEntries(pieces.map((p) => [p.id, [p.platform]]))
  );

  const approvedCount  = pieces.filter((p) => p.status === "approved").length;
  const readyCount     = pieces.filter((p) => p.status === "ready").length;
  const publishedCount = pieces.filter((p) => p.status === "published").length;
  const totalCount     = pieces.length;

  const doneCount  = pieces.filter((p) => ["approved", "published", "rejected"].includes(p.status)).length;
  const pct        = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  function handlePublish() {
    setPublishResult(null);
    startPublishing(async () => {
      const result = await publishApproved(campaignId, platformOverrides);
      setPublishResult(result);
    });
  }

  const byPlatform: Record<string, Piece[]> = {};
  for (const p of pieces) {
    if (!byPlatform[p.platform]) byPlatform[p.platform] = [];
    byPlatform[p.platform].push(p);
  }

  return (
    <div className="space-y-8">
      {/* Progress + stats */}
      <div className="space-y-3">
        <div className="flex items-center gap-4 text-xs text-bone/60">
          <span>{totalCount} pieces</span>
          <span>{readyCount} ready to review</span>
          <span>{approvedCount} approved</span>
          {publishedCount > 0 && <span className="text-sage">{publishedCount} published</span>}
        </div>
        <div className="h-1.5 w-full rounded-full bg-bone/10 overflow-hidden">
          <div className="h-full rounded-full bg-forest transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Publish button */}
      {approvedCount > 0 && (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="rounded bg-ochre px-5 py-2.5 text-sm font-medium text-ink hover:bg-ochre/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {publishing ? "Publishing…" : `Publish ${approvedCount} approved piece${approvedCount !== 1 ? "s" : ""}`}
          </button>
          <p className="text-xs text-bone/52">Social pieces post via Make.com. News pieces create a draft in /admin/news.</p>
        </div>
      )}

      {publishResult && (
        <div className="rounded border border-bone/15 p-4 space-y-1 text-sm">
          <p className="text-sage">✓ {publishResult.published} published</p>
          {publishResult.skipped > 0 && <p className="text-ochre">{publishResult.skipped} skipped (manual post required)</p>}
          {publishResult.errors.map((e, i) => <p key={i} className="text-rose text-xs">{e}</p>)}
        </div>
      )}

      {/* Pieces grouped by platform */}
      {Object.entries(byPlatform).map(([platform, platformPieces]) => (
        <div key={platform}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/52 mb-3 capitalize">{platform}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformPieces.map((piece) => (
              <PieceCard
                key={piece.id}
                piece={piece}
                publishPlatforms={platformOverrides[piece.id] ?? [piece.platform]}
                onPlatformsChange={(platforms) =>
                  setPlatformOverrides((prev) => ({ ...prev, [piece.id]: platforms }))
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
