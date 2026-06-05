import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import CampaignPiecesClient from "./CampaignPiecesClient";

const STATUS_STYLES: Record<string, string> = {
  draft:      "bg-bone/10 text-bone/40 border border-bone/15",
  generating: "bg-forest/20 text-forest border border-forest/25",
  review:     "bg-ochre/15 text-ochre border border-ochre/25",
  approved:   "bg-forest/25 text-forest border border-forest/30",
  publishing: "bg-ochre/20 text-ochre border border-ochre/30",
  done:       "bg-forest/30 text-forest border border-forest/30",
  failed:     "bg-oxblood/20 text-oxblood border border-oxblood/25",
};

const STATUS_LABEL: Record<string, string> = {
  draft:      "Draft",
  generating: "Generating…",
  review:     "Ready to review",
  approved:   "Approved",
  publishing: "Publishing…",
  done:       "Published",
  failed:     "Failed",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const [{ data: campaign, error }, { data: pieces }] = await Promise.all([
    supabase.from("content_campaigns").select("*").eq("id", id).single(),
    supabase.from("content_pieces").select("*").eq("campaign_id", id).order("sort_order"),
  ]);

  if (error || !campaign) notFound();

  const isGenerating = campaign.status === "generating" || (pieces ?? []).some((p) => p.status === "generating" || p.status === "pending");

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <Link href="/admin/campaigns" className="inline-flex items-center gap-1.5 text-xs text-bone/35 hover:text-bone/70 transition-colors mb-4">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M19 12H5M5 12l7-7M5 12l7 7" />
          </svg>
          Campaigns
        </Link>

        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display font-bold text-bone text-2xl">{campaign.title}</h1>
              <span className={`text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full border ${STATUS_STYLES[campaign.status] ?? STATUS_STYLES.draft}`}>
                {STATUS_LABEL[campaign.status] ?? campaign.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-bone/35">
              {campaign.source_type} · Created {formatDate(campaign.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Generating state */}
      {isGenerating && (
        <div className="rounded-lg border border-forest/20 bg-forest/[0.04] p-5 flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-forest animate-pulse shrink-0" />
          <div>
            <p className="text-sm text-forest font-medium">Generating content…</p>
            <p className="text-xs text-bone/40 mt-0.5">Claude is writing captions and generating images. This usually takes 1–3 minutes. Refresh to check progress.</p>
          </div>
          <a href={`/admin/campaigns/${id}`} className="ml-auto shrink-0 text-xs text-bone/30 hover:text-ochre transition-colors">
            Refresh ↻
          </a>
        </div>
      )}

      {/* Pieces */}
      {(pieces ?? []).length > 0 ? (
        <CampaignPiecesClient campaignId={id} pieces={pieces ?? []} />
      ) : campaign.status === "draft" ? (
        <div className="rounded-lg border border-bone/10 p-10 text-center text-bone/30 text-sm">
          Campaign created. Generation will start shortly.
        </div>
      ) : null}

      {/* Source preview (collapsed) */}
      <details className="group">
        <summary className="cursor-pointer text-xs text-bone/30 hover:text-bone/60 transition-colors list-none flex items-center gap-1.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-open:rotate-90 transition-transform" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
          View source content
        </summary>
        <pre className="mt-3 text-xs text-bone/40 leading-relaxed whitespace-pre-wrap font-sans bg-bone/5 rounded p-4 max-h-64 overflow-y-auto">
          {campaign.source_content}
        </pre>
      </details>
    </div>
  );
}
