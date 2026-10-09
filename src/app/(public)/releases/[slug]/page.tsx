import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/server";
import VideoEmbed from "@/components/VideoEmbed";
import PosterHeadline from "@/components/PosterHeadline";
import SectionHeader from "@/components/SectionHeader";
import LogoMark from "@/components/LogoMark";
import type { Tables } from "@/types/supabase";
import { buildSpotifyEmbedUrl } from "@/lib/spotify";

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

const TYPE_LABEL: Record<string, string> = {
  single:  "Single",
  ep:      "EP",
  album:   "Album",
  mixtape: "Mixtape",
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 5l4.3 4.3-4.3 4.3-4.3-4.3L12 5zm4.3 4.3l4.3 4.3-4.3 4.3-4.3-4.3 4.3-4.3zm-8.6 0l4.3 4.3-4.3 4.3-4.3-4.3 4.3-4.3z" />
      </svg>
    ),
  },
];

// Public detail page — releases and videos are public by RLS (USING true), so
// the cookieless service client returns identical rows. Served as ISR.
export const revalidate = 120;

// Prerender every release at build (releases are all public); slugs added later
// fall back to on-demand ISR (dynamicParams defaults to true).
export async function generateStaticParams() {
  const supabase = createServiceClient();
  const { data } = await supabase.from("releases").select("slug");
  return (data ?? []).map(({ slug }) => ({ slug }));
}

async function getRelease(slug: string) {
  const supabase = createServiceClient();
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
  const description =
    release.description ??
    `${release.title} by ${artist?.stage_name ?? "One Flame Records"} — ${TYPE_LABEL[release.type] ?? release.type}.`;

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
  const supabase = createServiceClient();

  const release = await getRelease(slug);
  if (!release) notFound();

  const artist = release.artists as { id: string; stage_name: string; slug: string } | null;

  const { data: video } = await supabase
    .from("videos")
    .select("*, artists(stage_name)")
    .eq("release_id", release.id)
    .limit(1)
    .returns<VideoRow[]>()
    .maybeSingle();

  const streaming = (release.streaming_links as StreamingLinks) ?? {};
  const activeStreaming = STREAMING_SERVICES.filter(({ key }) => streaming[key]);
  const spotifyEmbedUrl = streaming.spotify ? buildSpotifyEmbedUrl(streaming.spotify, "album") : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://oneflamerecords.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicAlbum",
    name: release.title,
    description: release.description || undefined,
    image: release.cover_url || undefined,
    datePublished: release.release_date,
    url: `${siteUrl}/releases/${release.slug}`,
    ...(artist && {
      byArtist: {
        "@type": "MusicGroup",
        name: artist.stage_name,
        url: `${siteUrl}/artists/${artist.slug}`,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }}
      />

      {/* ── Header ── */}
      <section className="bg-black">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 sm:pt-14 pb-14">
          <Link
            href="/releases"
            className="type-label text-yellow underline underline-offset-4 focus-on-black"
          >
            All releases
          </Link>

          {/* Cover + headline */}
          <div className="mt-8 flex flex-col sm:flex-row gap-7 sm:gap-10 items-start">
            {/* Cover: artwork, so it is shown as supplied (not printed) */}
            <div className="relative w-40 sm:w-52 aspect-square shrink-0 bg-panel">
              {release.cover_url ? (
                <Image
                  src={release.cover_url}
                  alt={`${release.title} cover`}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 640px) 160px, 208px"
                />
              ) : (
                <div className="absolute inset-0 bg-red grid place-items-center">
                  <LogoMark variant="flame" ground="red" height={56} alt="" />
                </div>
              )}
            </div>

            {/* Title block */}
            <div className="flex flex-col justify-end min-w-0">
              <span className="self-start bg-red text-paper px-3 py-1.5 type-label mb-4">
                {TYPE_LABEL[release.type] ?? release.type}
              </span>
              <PosterHeadline as="h1" size="headline" className="text-paper">
                {release.title}
              </PosterHeadline>
              <span aria-hidden="true" className="section-bar mt-2" />
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 type-small">
                {artist && (
                  <Link
                    href={`/artists/${artist.slug}`}
                    className="text-yellow underline underline-offset-2 focus-on-black [overflow-wrap:anywhere]"
                  >
                    {artist.stage_name}
                  </Link>
                )}
                <span className="text-muted">{formatDate(release.release_date)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="bg-black border-t border-line">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px]">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10">

            {/* Left: description + video */}
            <div className="min-w-0">
              {release.description && (
                <p className="type-body text-paper max-w-[66ch] mb-10 [overflow-wrap:anywhere]">
                  {release.description}
                </p>
              )}

              {spotifyEmbedUrl && (
                <div className="mb-10 max-w-2xl">
                  <iframe
                    src={spotifyEmbedUrl}
                    title={`${release.title} on Spotify`}
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="block w-full"
                  />
                </div>
              )}

              {video && (
                <>
                  <SectionHeader title="Video" />
                  <div className="max-w-2xl">
                    <VideoEmbed
                      youtube_id={video.youtube_id}
                      storage_url={video.storage_url}
                      title={video.title}
                      artist_name={video.artists?.stage_name ?? artist?.stage_name ?? ""}
                      priority
                    />
                  </div>
                </>
              )}
            </div>

            {/* Right: streaming links */}
            {activeStreaming.length > 0 && (
              <div className="md:w-56 shrink-0">
                <p className="type-label text-muted mb-3">Listen on</p>
                <div className="flex flex-col gap-2">
                  {activeStreaming.map(({ key, label, buildUrl, Icon }) => (
                    <a
                      key={key}
                      href={buildUrl(streaming[key]!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${label} (opens in a new tab)`}
                      className="inline-flex min-h-[46px] items-center gap-3 px-4 bg-black text-yellow shadow-[inset_0_0_0_2px_var(--color-yellow)] type-button hover:bg-yellow hover:text-black focus-on-black"
                    >
                      <Icon />
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
