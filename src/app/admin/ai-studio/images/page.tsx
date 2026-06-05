import { Suspense } from "react";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import ImageGeneratorForm from "./ImageGeneratorForm";

export default async function AIImagesPage() {
  const supabase = createServiceClient();

  const [{ data: artists }, { data: releases }, { data: posts }] = await Promise.all([
    supabase.from("artists").select("id, stage_name").eq("status", "active").order("stage_name"),
    supabase.from("releases").select("id, title").order("title"),
    supabase.from("news_posts").select("id, title").eq("is_published", false).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Link href="/admin/ai-studio" className="text-xs text-bone/30 hover:text-bone/60 transition-colors">
            AI Studio
          </Link>
          <span className="text-bone/20 text-xs">/</span>
          <span className="text-xs text-bone/60">Images</span>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forest mb-1">DALL-E 3</p>
        <h1 className="font-display font-bold text-bone text-2xl">Image Generator</h1>
        <p className="mt-1 text-sm text-bone/50">
          Generate artist photos, release covers, and promotional images. Images are saved to your media library.
        </p>
      </div>

      <Suspense>
        <ImageGeneratorForm
          artists={artists ?? []}
          releases={releases ?? []}
          posts={posts ?? []}
        />
      </Suspense>
    </div>
  );
}
