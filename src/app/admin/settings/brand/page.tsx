import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import BrandClipUploader from "./BrandClipUploader";

export default async function BrandSettingsPage() {
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

  const introUrl = map["brand_intro_clip_url"] ?? null;
  const outroUrl = map["brand_outro_clip_url"] ?? null;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link
          href="/admin/settings"
          className="text-xs text-bone/60 hover:text-ochre transition-colors"
        >
          ← Settings
        </Link>
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sage mb-2">
            Label Admin
          </p>
          <h1 className="font-display font-bold text-bone text-3xl">Brand Video Clips</h1>
          <div className="mt-3 h-px w-16 bg-bone/20" />
        </div>
        <p className="mt-4 text-sm text-bone/50 leading-relaxed">
          Upload a pre-recorded intro and outro clip to bookend every AI-generated music video.
          If no clip is set, the pipeline generates a text card using the brand colours instead.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-bone/60 uppercase tracking-wider mb-3">
            Intro clip
          </h2>
          <p className="text-xs text-bone/60 mb-3">
            Plays before the music video begins. Typically 3–8 seconds. Include the One Flame
            Records logo and/or &ldquo;Presents&rdquo; title card.
          </p>
          <BrandClipUploader
            label="Intro clip"
            settingKey="brand_intro_clip_url"
            currentUrl={introUrl}
          />
        </div>

        <div className="h-px bg-bone/10" />

        <div>
          <h2 className="text-sm font-semibold text-bone/60 uppercase tracking-wider mb-3">
            Outro clip
          </h2>
          <p className="text-xs text-bone/60 mb-3">
            Plays after the music video ends. Typically 3–6 seconds. Include the One Flame
            Records logo, website, and/or social handles.
          </p>
          <BrandClipUploader
            label="Outro clip"
            settingKey="brand_outro_clip_url"
            currentUrl={outroUrl}
          />
        </div>
      </div>
    </div>
  );
}
