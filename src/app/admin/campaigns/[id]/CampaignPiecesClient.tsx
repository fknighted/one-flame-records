"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { approvePiece, rejectPiece, regeneratePiece, publishApproved } from "./actions";

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

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-[#E1306C]/15 text-[#E1306C] border border-[#E1306C]/25",
  tiktok:    "bg-bone/10 text-bone border border-bone/20",
  facebook:  "bg-[#1877F2]/15 text-[#1877F2] border border-[#1877F2]/25",
};

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-bone/10 text-bone/40",
  generating: "bg-forest/20 text-forest animate-pulse",
  ready:      "bg-ochre/15 text-ochre",
  approved:   "bg-forest/25 text-forest",
  rejected:   "bg-oxblood/20 text-oxblood",
  publishing: "bg-ochre/20 text-ochre animate-pulse",
  published:  "bg-forest/30 text-forest",
  failed:     "bg-oxblood/20 text-oxblood",
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

function PieceCard({ piece }: { piece: Piece }) {
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();

  const canApprove  = piece.status === "ready";
  const canReject   = piece.status === "ready" || piece.status === "approved";
  const canRegen    = piece.status === "ready" || piece.status === "rejected" || piece.status === "failed";

  return (
    <div className={`rounded-lg border overflow-hidden transition-colors ${
      piece.status === "approved" ? "border-forest/30 bg-forest/[0.03]" :
      piece.status === "rejected" ? "border-oxblood/20 opacity-60" :
      piece.status === "published" ? "border-forest/20 opacity-70" :
      "border-bone/10 hover:border-bone/20"
    }`}>
      {/* Image */}
      {piece.image_url && (
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
          <span className="text-[10px] text-bone/35 uppercase tracking-wider">
            {piece.content_type.replace("_", " ")}
          </span>
          <span className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[piece.status] ?? "bg-bone/10 text-bone/40"}`}>
            {STATUS_LABEL[piece.status] ?? piece.status}
          </span>
        </div>

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
              className="text-xs text-bone/40 hover:text-ochre transition-colors"
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

        {/* Error */}
        {piece.error && (
          <p className="text-xs text-oxblood bg-oxblood/10 rounded p-2">{piece.error}</p>
        )}

        {/* Published timestamp */}
        {piece.published_at && (
          <p className="text-[11px] text-bone/30">
            Published {new Date(piece.published_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        )}

        {/* Actions */}
        {(canApprove || canReject || canRegen) && (
          <div className="flex gap-2 pt-1 border-t border-bone/8">
            {canApprove && (
              <form action={() => { startTransition(() => approvePiece(piece.id)); }}>
                <button type="submit" disabled={pending} className="text-xs px-3 py-1.5 rounded bg-forest/20 text-forest hover:bg-forest/30 disabled:opacity-50 transition-colors">
                  ✓ Approve
                </button>
              </form>
            )}
            {canReject && (
              <form action={() => { startTransition(() => rejectPiece(piece.id)); }}>
                <button type="submit" disabled={pending} className="text-xs px-3 py-1.5 rounded bg-bone/10 text-bone/50 hover:bg-oxblood/20 hover:text-oxblood disabled:opacity-50 transition-colors">
                  Reject
                </button>
              </form>
            )}
            {canRegen && (
              <form action={() => { startTransition(() => regeneratePiece(piece.id)); }}>
                <button type="submit" disabled={pending} className="text-xs text-bone/30 hover:text-ochre transition-colors ml-auto">
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

  const approvedCount  = pieces.filter((p) => p.status === "approved").length;
  const readyCount     = pieces.filter((p) => p.status === "ready").length;
  const publishedCount = pieces.filter((p) => p.status === "published").length;
  const totalCount     = pieces.length;

  const doneCount  = pieces.filter((p) => ["approved", "published", "rejected"].includes(p.status)).length;
  const pct        = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  function handlePublish() {
    setPublishResult(null);
    startPublishing(async () => {
      const result = await publishApproved(campaignId);
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
        <div className="flex items-center gap-4 text-xs text-bone/40">
          <span>{totalCount} pieces</span>
          <span>{readyCount} ready to review</span>
          <span>{approvedCount} approved</span>
          {publishedCount > 0 && <span className="text-forest">{publishedCount} published</span>}
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
          <p className="text-xs text-bone/35">Posts to Instagram, TikTok, and Facebook via their APIs.</p>
        </div>
      )}

      {publishResult && (
        <div className="rounded border border-bone/15 p-4 space-y-1 text-sm">
          <p className="text-forest">✓ {publishResult.published} published</p>
          {publishResult.skipped > 0 && <p className="text-ochre">{publishResult.skipped} skipped (manual post required)</p>}
          {publishResult.errors.map((e, i) => <p key={i} className="text-oxblood text-xs">{e}</p>)}
        </div>
      )}

      {/* Pieces grouped by platform */}
      {Object.entries(byPlatform).map(([platform, platformPieces]) => (
        <div key={platform}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/35 mb-3 capitalize">{platform}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformPieces.map((piece) => (
              <PieceCard key={piece.id} piece={piece} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
