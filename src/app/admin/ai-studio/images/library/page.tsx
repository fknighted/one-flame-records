import Link from "next/link";
import Image from "next/image";
import { createServiceClient } from "@/lib/supabase/server";
import CopyUrlButton from "./CopyUrlButton";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

const PURPOSE_LABEL: Record<string, string> = {
  artist_photo:  "Artist Photo",
  release_cover: "Release Cover",
  news_cover:    "News Cover",
  standalone:    "Standalone",
  campaign:      "Campaign",
};

export default async function ImageLibraryPage() {
  const supabase = createServiceClient();
  const { data: images } = await supabase
    .from("ai_generated_images")
    .select("id, url, prompt, purpose, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Link href="/admin/ai-studio" className="text-xs text-bone/30 hover:text-bone/60 transition-colors">
            AI Studio
          </Link>
          <span className="text-bone/20 text-xs">/</span>
          <Link href="/admin/ai-studio/images" className="text-xs text-bone/30 hover:text-bone/60 transition-colors">
            Images
          </Link>
          <span className="text-bone/20 text-xs">/</span>
          <span className="text-xs text-bone/60">Library</span>
        </div>
        <h1 className="font-display font-bold text-bone text-2xl">Image Library</h1>
        <p className="mt-1 text-sm text-bone/50">All AI-generated images, newest first.</p>
      </div>

      {!images?.length ? (
        <div className="border border-bone/10 rounded-lg p-12 text-center text-bone/30 text-sm">
          No images generated yet.{" "}
          <Link href="/admin/ai-studio/images" className="underline hover:text-bone/60">
            Generate the first one.
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((img) => (
            <div key={img.id} className="group rounded-lg overflow-hidden border border-bone/10 hover:border-bone/20 transition-colors bg-ink">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={img.url}
                  alt={img.prompt ?? "Generated image"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  unoptimized
                />
              </div>
              <div className="p-3 space-y-1.5">
                {img.purpose && (
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-ochre/70">
                    {PURPOSE_LABEL[img.purpose] ?? img.purpose}
                  </span>
                )}
                {img.prompt && (
                  <p className="text-xs text-bone/50 leading-snug line-clamp-2">{img.prompt}</p>
                )}
                <p className="text-[10px] text-bone/25">{formatDate(img.created_at)}</p>
                <div className="flex gap-3 pt-1">
                  <a
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-bone/40 hover:text-ochre transition-colors"
                  >
                    Download
                  </a>
                  <CopyUrlButton url={img.url} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
