import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import CopyGeneratorForm from "./CopyGeneratorForm";

export default async function AICopyPage() {
  const supabase = createServiceClient();
  const { data: artists } = await supabase
    .from("artists")
    .select("id, stage_name")
    .eq("status", "active")
    .order("stage_name");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Link href="/admin/ai-studio" className="text-xs text-bone/50 hover:text-bone/60 transition-colors">
            AI Studio
          </Link>
          <span className="text-bone/52 text-xs">/</span>
          <span className="text-xs text-bone/60">Copy</span>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sage mb-1">Claude</p>
        <h1 className="font-display font-bold text-bone text-2xl">Copy Generator</h1>
        <p className="mt-1 text-sm text-bone/50">
          Draft artist bios, release descriptions, news posts, and captions in the One Flame voice.
        </p>
      </div>

      <CopyGeneratorForm artists={artists ?? []} />
    </div>
  );
}
