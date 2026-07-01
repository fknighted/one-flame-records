import { createServiceClient } from "@/lib/supabase/server";

// Returns public URLs for the pre-recorded brand intro and outro clips,
// or null if no clip has been configured (assemble.ts falls back to
// FFmpeg-generated text cards in that case).
export async function getBrandClipUrls(): Promise<{
  introUrl: string | null;
  outroUrl: string | null;
}> {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", ["brand_intro_clip_url", "brand_outro_clip_url"]);

  const map: Record<string, string | null> = {};
  for (const row of data ?? []) {
    const v = row.value;
    map[row.key] = typeof v === "string" && v.length > 0 ? v : null;
  }

  return {
    introUrl: map["brand_intro_clip_url"] ?? null,
    outroUrl: map["brand_outro_clip_url"] ?? null,
  };
}
