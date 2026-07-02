import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import DeleteCampaignButton from "./DeleteCampaignButton";

const STATUS_STYLES: Record<string, string> = {
  draft:       "bg-bone/10 text-bone/60 border border-bone/15",
  generating:  "bg-forest/20 text-sage border border-forest/25",
  review:      "bg-ochre/15 text-ochre border border-ochre/25",
  approved:    "bg-forest/30 text-sage border border-forest/30",
  publishing:  "bg-ochre/20 text-ochre border border-ochre/30",
  done:        "bg-forest/30 text-sage border border-forest/30",
  failed:      "bg-oxblood/20 text-rose border border-oxblood/25",
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

const SOURCE_ICON: Record<string, string> = {
  video:      "▶",
  post:       "✍",
  newsletter: "✉",
  text:       "¶",
  url:        "🔗",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function CampaignsPage() {
  const supabase = createServiceClient();

  const { data: campaigns } = await supabase
    .from("content_campaigns")
    .select("id, title, source_type, status, created_at")
    .order("created_at", { ascending: false });

  // Get piece counts per campaign
  const { data: pieceCounts } = await supabase
    .from("content_pieces")
    .select("campaign_id, status");

  const countMap: Record<string, { total: number; approved: number; published: number }> = {};
  for (const p of pieceCounts ?? []) {
    if (!countMap[p.campaign_id]) countMap[p.campaign_id] = { total: 0, approved: 0, published: 0 };
    countMap[p.campaign_id].total++;
    if (p.status === "approved") countMap[p.campaign_id].approved++;
    if (p.status === "published") countMap[p.campaign_id].published++;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sage mb-2">AI Studio</p>
          <h1 className="font-display font-bold text-bone text-3xl">Campaigns</h1>
          <div className="mt-3 h-px w-16 bg-bone/20" />
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <Link
            href="/admin/campaigns/ideas"
            className="text-sm text-bone/60 hover:text-ochre transition-colors"
          >
            Ideas →
          </Link>
          <Link
            href="/admin/campaigns/new"
            className="shrink-0 bg-ochre text-ink text-sm font-medium px-4 py-2 rounded hover:bg-ochre/90 transition-colors"
          >
            + New Campaign
          </Link>
        </div>
      </div>

      {!campaigns?.length ? (
        <div className="border border-bone/10 rounded-lg p-12 text-center text-bone/50 text-sm">
          No campaigns yet.{" "}
          <Link href="/admin/campaigns/new" className="underline hover:text-bone/60">
            Create the first one.
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => {
            const counts = countMap[c.id] ?? { total: 0, approved: 0, published: 0 };
            return (
              <div
                key={c.id}
                className="relative flex items-center gap-4 rounded-lg border border-bone/10 p-4 hover:border-bone/20 hover:bg-bone/[0.02] transition-colors group"
              >
                <Link
                  href={`/admin/campaigns/${c.id}`}
                  className="absolute inset-0 rounded-lg"
                  aria-label={c.title}
                />
                <span className="relative z-10 text-xl shrink-0 opacity-50">
                  {SOURCE_ICON[c.source_type] ?? "•"}
                </span>
                <div className="relative z-10 flex-1 min-w-0">
                  <p className="text-bone font-medium group-hover:text-ochre transition-colors truncate">{c.title}</p>
                  <p className="text-xs text-bone/52 mt-0.5">
                    {counts.total} piece{counts.total !== 1 ? "s" : ""}
                    {counts.approved > 0 && ` · ${counts.approved} approved`}
                    {counts.published > 0 && ` · ${counts.published} published`}
                    {" · "}{formatDate(c.created_at)}
                  </p>
                </div>
                <span className={`relative z-10 shrink-0 text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full ${STATUS_STYLES[c.status] ?? STATUS_STYLES.draft}`}>
                  {STATUS_LABEL[c.status] ?? c.status}
                </span>
                <DeleteCampaignButton id={c.id} title={c.title} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
