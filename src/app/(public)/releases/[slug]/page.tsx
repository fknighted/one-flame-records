import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import VideoEmbed from "@/components/VideoEmbed";
import type { Tables } from "@/types/supabase";

type Props = { params: Promise<{ slug: string }> };

type StreamingLinks = {
  spotify?: string;
  apple_music?: string;
  tidal?: string;
  youtube_music?: string;
};

type VideoRow = Tables<"videos"> & {
  artists: { stage_name: string } | null;
};

const TYPE_STYLES: Record<string, string> = {
  single:  "bg-ochre text-ink",
  ep:      "bg-forest text-bone",
  album:   "bg-oxblood text-bone",
  mixtape: "bg-ink text-bone",
};

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const STREAMING_SERVICES: {
  key: keyof StreamingLinks;
  label: string;
  buildUrl: (v: string) => string;
  Icon: React.FC;
}[] = [
  {
    key: "spotify",
    label: "Spotify",
    buildUrl: (v) => v.startsWith("http") ? v : `https://open.spotify.com/album/${v}`,
    Icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 9.5C9.5 8.5 14 8.5 17 10M6.5 12.5C9.5 11 14.5 11 17.5 12.5M8 15.5C10 14.5 14 14.5 16 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "apple_music",
    label: "Apple Music",
    buildUrl: (v) => v.startsWith("http") ? v : `https://music.apple.com/album/${v}`,
    Icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    key: "youtube_music",
    label: "YouTube Music",
    buildUrl: (v) => v.startsWith("http") ? v : `https://music.youtube.com/browse/${v}`,
    Icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
        <polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: "tidal",
    label: "Tidal",
    buildUrl: (v) => v.startsWith("http") ? v : `https://tidal.com/browse/album/${v}`,
    Icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 5l4.3 4.3-4.3 4.3-4.3-4.3L12 5zm4.3 4.3l4.3 4.3-4.3 4.3-4.3-4.3 4.3-4.3zm-8.6 0l4.3 4.3-4.3 4.3-4.3-4.3 4.3-4.3z" />
      </svg>
    ),
  },
];

async function getRelease(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("releases")
    .select("*, artists(id, stage_name, slug)")
    .eq("slug", slug)
    .single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const release = await getRelease(slug);
  if (!release) return { title: "Release not found — One Flame Records" };

  const artist = release.artists as { stage_name: string; slug: string } | null;
  const description = release.description
    ?? `${release.title} by ${artist?.stage_name ?? "One Flame Records"} — ${release.type}.`;

  return {
    title: `${release.title} — One Flame Records`,
    description,
    openGraph: {
      title: release.title,
      description,
      images: release.cover_url ? [{ url: release.cover_url, alt: release.title }] : [],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function ReleaseDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const release = await getRelease(slug);
  if (!release) notFound();

  const artist = release.artists as { id: string; stage_name: string; slug: string } | null;

  // Linked video (if any)
  const { data: video } = await supabase
    .from("videos")
    .select("*, artists(stage_name)")
    .eq("release_id", release.id)
    .limit(1)
    .returns<VideoRow[]>()
    .maybeSingle();

  const streaming = (release.streaming_links as StreamingLinks) ?? {};
  const activeStreaming = STREAMING_SERVICES.filter(({ key }) => streaming[key]);
  const pillStyle = TYPE_STYLES[release.type] ?? "bg-ink/10 text-ink";

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
      {/* Cover + metadata */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-start">
        {/* Cover */}
        <div className="relative w-full md:w-64 lg:w-80 aspect-square bg-oxblood/5 overflow-hidden shrink-0 shadow-md">
          {release.cover_url ? (
            <Image
              src={release.cover_url}
              alt={`${release.title} cover`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 320px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 20 28" className="w-14 h-auto opacity-20" aria-hidden="true">
                <path d="M10 1C10 1 4 9 4 16C4 19.8 6.3 23.1 10 25C13.7 23.1 16 19.8 16 16C16 9 10 1 10 1Z" fill="#8B2A1F" />
              </svg>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-col gap-4">
          <div>
            <span className={`inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-sm mb-3 ${pillStyle}`}>
              {release.type}
            </span>
            <h1 className="font-display font-bold text-oxblood text-[clamp(1.75rem,4vw,3rem)] leading-tight tracking-tight">
              {release.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink/60">
              {artist && (
                <Link href={`/artists/${artist.slug}`} className="font-medium text-ink hover:text-oxblood transition-colors">
                  {artist.stage_name}
                </Link>
              )}
              <span className="text-ink/30">·</span>
              <span>{formatDate(release.release_date)}</span>
            </div>
          </div>

          {release.description && (
            <p className="text-ink/70 leading-relaxed max-w-prose">{release.description}</p>
          )}

          {/* Streaming buttons */}
          {activeStreaming.length > 0 && (
            <div className="flex flex-col gap-2 pt-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink/40 mb-1">
                Listen on
              </p>
              {activeStreaming.map(({ key, label, buildUrl, Icon }) => (
                <a
                  key={key}
                  href={buildUrl(streaming[key]!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 w-full sm:w-auto rounded border border-oxblood/20 px-4 py-2.5 text-sm font-medium text-ink hover:border-oxblood hover:bg-oxblood hover:text-bone transition-colors"
                >
                  <Icon />
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Linked video */}
      {video && (
        <div className="mt-14">
          <h2 className="font-display font-bold text-oxblood text-2xl mb-1">Video</h2>
          <div className="mt-2 h-px w-10 bg-oxblood mb-6" />
          <div className="max-w-2xl">
            <VideoEmbed
              youtube_id={video.youtube_id}
              title={video.title}
              artist_name={video.artists?.stage_name ?? artist?.stage_name ?? ""}
              priority
            />
          </div>
        </div>
      )}

      {/* Back link */}
      <div className="mt-14 pt-6 border-t border-oxblood/10">
        <Link href="/releases" className="text-sm text-oxblood hover:text-ochre transition-colors">
          ← All releases
        </Link>
      </div>
    </div>
  );
}
