import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import IdeasClient from "./IdeasClient";
import type { Idea } from "./constants";

export default async function IdeasPage() {
  const supabase = createServiceClient();
  const { data: ideas } = await supabase
    .from("campaign_ideas")
    .select("id, title, angle, pillar, source_type, suggested_platforms, status, created_at")
    .neq("status", "dismissed")
    .order("created_at", { ascending: false })
    .returns<Idea[]>();

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Link href="/admin/campaigns" className="text-xs text-bone/30 hover:text-bone/60 transition-colors">
            Campaigns
          </Link>
          <span className="text-bone/20 text-xs">/</span>
          <span className="text-xs text-bone/60">Ideas</span>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forest mb-2">AI Studio</p>
            <h1 className="font-display font-bold text-bone text-3xl">Campaign Ideas</h1>
            <div className="mt-3 h-px w-16 bg-bone/20" />
          </div>
        </div>
        <p className="mt-3 text-sm text-bone/50 max-w-lg">
          Draft ideas organised by content pillar. Hit "Generate ideas" and Claude will suggest campaigns
          based on your roster, recent releases, and news. Click "Start Campaign" to expand any idea into a full campaign.
        </p>
      </div>

      <IdeasClient initialIdeas={ideas ?? []} />
    </div>
  );
}
