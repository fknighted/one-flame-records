import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/server";
import ReleaseCard from "@/components/ReleaseCard";
import VideoEmbed from "@/components/VideoEmbed";
import SectionHeader from "@/components/SectionHeader";
import PrintedPhoto from "@/components/PrintedPhoto";
import { buttonClasses } from "@/lib/sound-system";
import type { Tables } from "@/types/supabase";
import { buildSpotifyEmbedUrl } from "@/lib/spotify";

type Props = { params: Promise<{ slug: string }> };

type StreamingData = {
  spotify?: string;
  apple_music?: string;
  tidal?: string;
};

type SocialData = {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  youtube?: string;
};

type ReleaseRow = Tables<"releases"> & {
  artists: { stage_name: string; slug: string } | null;
};

type VideoRow = Tables<"videos"> & {
  artists: { stage_name: string } | null;
};

type AssetRow = Tables<"assets">;
type VideoJobRow = Tables<"video_jobs">;

// Public detail page — cookieless service-client reads, served as ISR.
// getArtist gates on status='active' (the artists RLS public rule); releases
// and videos are public by RLS; assets/video_jobs already filter is_public.
// Signed URLs (1h TTL) are minted per-request below, well within revalidate.
export const revalidate = 120;

// Prerender every active artist at build; slugs added later fall back to
// on-demand ISR (dynamicParams defaults to true).
export async function generateStaticParams() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("artists")
    .select("slug")
    .eq("status", "active");
  return (data ?? []).map(({ slug }) => ({ slug }));
}

async function getArtist(slug: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("artists")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtist(slug);
  if (!artist) return { title: "Artist not found — One Flame Records" };

  const description = artist.bio ? artist.bio.slice(0, 160) : `${artist.stage_name} on One Flame Records.`;

  return {
    title: `${artist.stage_name} — One Flame Records`,
    description,
    openGraph: {
      title: artist.stage_name,
      description,
      images: artist.photo_url ? [{ url: artist.photo_url, alt: artist.stage_name }] : [],
    },
    twitter: { card: "summary_large_image" },
  };
}

const STREAMING_SERVICES: { key: keyof StreamingData; label: string; buildUrl: (val: string) => string }[] = [
  {
    key: "spotify",
    label: "Spotify",
    buildUrl: (v) => v.startsWith("http") ? v : `https://open.spotify.com/artist/${v}`,
  },
  {
    key: "apple_music",
    label: "Apple Music",
    buildUrl: (v) => v.startsWith("http") ? v : `https://music.apple.com/artist/${v}`,
  },
  {
    key: "tidal",
    label: "Tidal",
    buildUrl: (v) => v.startsWith("http") ? v : `https://tidal.com/browse/artist/${v}`,
  },
];

const SOCIAL_SERVICES: { key: keyof SocialData; label: string; buildUrl: (val: string) => string }[] = [
  { key: "instagram", label: "Instagram", buildUrl: (v) => v.startsWith("http") ? v : `https://instagram.com/${v.replace("@", "")}` },
  { key: "twitter",   label: "Twitter / X", buildUrl: (v) => v.startsWith("http") ? v : `https://x.com/${v.replace("@", "")}` },
  { key: "facebook",  label: "Facebook", buildUrl: (v) => v.startsWith("http") ? v : `https://facebook.com/${v}` },
  { key: "youtube",   label: "YouTube", buildUrl: (v) => v.startsWith("http") ? v : `https://youtube.com/@${v.replace("@", "")}` },
];

function BioParagraphs({ bio }: { bio: string }) {
  const paras = bio.split(/\n\n+/).filter(Boolean);
  return (
    <div className="space-y-4 type-body max-w-[66ch]">
      {paras.map((p, i) => (
        <p key={i} className="[overflow-wrap:anywhere]">{p}</p>
      ))}
    </div>
  );
}

const PILL = "border-2 border-black px-2.5 py-[3px] font-bold text-[13px] [overflow-wrap:anywhere]";

export default async function ArtistDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const artist = await getArtist(slug);
  if (!artist) notFound();

  const service = createServiceClient();

  const [{ data: releases }, { data: videos }, { data: publicAssets }, { data: publicJobs }] = await Promise.all([
    supabase
      .from("releases")
      .select("*, artists(stage_name, slug)")
      .eq("artist_id", artist.id)
      .order("release_date", { ascending: false })
      .returns<ReleaseRow[]>(),

    supabase
      .from("videos")
      .select("*, artists(stage_name)")
      .eq("artist_id", artist.id)
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false })
      .returns<VideoRow[]>(),

    // Public assets — metadata readable via RLS; signed URLs generated server-side
    service
      .from("assets")
      .select("*")
      .eq("artist_id", artist.id)
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .returns<AssetRow[]>(),

    // Completed public video jobs
    service
      .from("video_jobs")
      .select("*")
      .eq("artist_id", artist.id)
      .eq("is_public", true)
      .eq("status", "complete")
      .order("completed_at", { ascending: false })
      .returns<VideoJobRow[]>(),
  ]);

  // Sign public asset URLs in one request (files live in private-assets bucket)
  const assetPaths = (publicAssets ?? []).map((asset) => asset.storage_path);
  const { data: signedAssets } = assetPaths.length
    ? await service.storage.from("private-assets").createSignedUrls(assetPaths, 3600)
    : { data: [] };
  const assetsWithUrls = (publicAssets ?? []).map((asset, i) => ({
    ...asset,
    signedUrl: signedAssets?.[i]?.signedUrl ?? null,
  }));

  // Sign generated-video URLs in one request (path is always videos/{id}.mp4)
  const jobPaths = (publicJobs ?? []).map((job) => `videos/${job.id}.mp4`);
  const { data: signedJobs } = jobPaths.length
    ? await service.storage.from("generated-videos").createSignedUrls(jobPaths, 3600)
    : { data: [] };
  const jobsWithUrls = (publicJobs ?? []).map((job, i) => ({
    ...job,
    videoUrl: signedJobs?.[i]?.signedUrl ?? null,
  }));

  const publicPhotos = assetsWithUrls.filter((a) => a.kind === "reference_image");
  const publicMusic = assetsWithUrls.filter((a) => a.kind === "instrumental" || a.kind === "demo");

  const streaming = (artist.streaming as StreamingData) ?? {};
  const socials = (artist.socials as SocialData) ?? {};
  const activeStreaming = STREAMING_SERVICES.filter(({ key }) => streaming[key]);
  const activeSocials = SOCIAL_SERVICES.filter(({ key }) => socials[key]);
  const spotifyArtistEmbedUrl = streaming.spotify ? buildSpotifyEmbedUrl(streaming.spotify, "artist") : null;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://oneflamerecords.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: artist.stage_name,
    description: artist.bio || undefined,
    image: artist.photo_url || undefined,
    url: `${siteUrl}/artists/${artist.slug}`,
    genre: artist.genres,
    foundingLocation: { "@type": "Place", name: artist.hometown ?? "Jamaica" },
  };

  const initial = Array.from(artist.stage_name.trim())[0] ?? "";
  const longName = artist.stage_name.length > 14;
  const musicDuration = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }}
      />

      {/* Name block (red) and info panel (paper) */}
      <section className="grid md:grid-cols-[1fr_1.2fr]">
        <div className="bg-red text-paper min-w-0">
          <div className="relative overflow-hidden min-h-[300px] p-[26px] grid content-end">
            <span
              aria-hidden="true"
              className="absolute -right-5 -top-[30px] font-poster font-black uppercase text-[200px] sm:text-[300px] leading-[0.8] text-black/20 select-none"
            >
              {initial}
            </span>
            <h1
              className={`relative font-poster font-black uppercase leading-[0.8] [overflow-wrap:anywhere] ${
                longName ? "text-[clamp(44px,8vw,80px)]" : "text-[clamp(64px,10vw,124px)]"
              }`}
            >
              {artist.stage_name}
            </h1>
          </div>
          {artist.photo_url && (
            <div className="relative aspect-[4/3] w-full bg-red">
              <PrintedPhoto
                tone="red"
                src={artist.photo_url}
                alt={artist.stage_name}
                fill
                priority
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 45vw"
              />
            </div>
          )}
        </div>

        <div className="bg-paper text-black p-[22px] sm:p-8 md:min-h-[300px] grid gap-5 content-start min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className={PILL}>Signed to One Flame</span>
            {artist.hometown && <span className={PILL}>{artist.hometown}</span>}
            {(artist.genres ?? []).map((g) => (
              <span key={g} className={PILL}>{g}</span>
            ))}
          </div>

          {artist.bio && (
            <div className="text-black">
              <BioParagraphs bio={artist.bio} />
            </div>
          )}

          {spotifyArtistEmbedUrl && (
            <iframe
              src={spotifyArtistEmbedUrl}
              title={`${artist.stage_name} on Spotify`}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          )}

          {activeStreaming.length > 0 && (
            <div>
              <h2 className="type-label text-black mb-3">Stream</h2>
              <div className="flex flex-wrap gap-2">
                {activeStreaming.map(({ key, label, buildUrl }) => (
                  <a
                    key={key}
                    href={buildUrl(streaming[key]!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses("dark", "paper")}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {activeSocials.length > 0 && (
            <div>
              <h2 className="type-label text-black mb-3">Follow</h2>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {activeSocials.map(({ key, label, buildUrl }) => (
                  <a
                    key={key}
                    href={buildUrl(socials[key]!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="type-label text-red underline underline-offset-4 inline-flex min-h-[44px] items-center focus-on-paper"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Releases, videos, photos, music on black */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px] space-y-14 sm:space-y-[88px]">
        {releases && releases.length > 0 && (
          <section>
            <SectionHeader title="Releases" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {releases.map((r) => (
                <ReleaseCard
                  key={r.id}
                  slug={r.slug}
                  title={r.title}
                  cover_url={r.cover_url}
                  release_date={r.release_date}
                  type={r.type}
                  artist_name={r.artists?.stage_name ?? artist.stage_name}
                  artist_slug={r.artists?.slug ?? slug}
                  streaming_links={(r.streaming_links as Record<string, string>) ?? {}}
                />
              ))}
            </div>
          </section>
        )}

        {videos && videos.length > 0 && (
          <section>
            <SectionHeader title="Videos" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {videos.map((v, i) => (
                <VideoEmbed
                  key={v.id}
                  youtube_id={v.youtube_id}
                  storage_url={v.storage_url}
                  title={v.title}
                  artist_name={v.artists?.stage_name ?? artist.stage_name}
                  priority={i === 0}
                />
              ))}
            </div>
          </section>
        )}

        {jobsWithUrls.length > 0 && (
          <section>
            <SectionHeader title="Saved videos" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {jobsWithUrls.map((job) =>
                job.videoUrl ? (
                  <div key={job.id} className="bg-panel min-w-0">
                    <video
                      src={job.videoUrl}
                      controls
                      preload="metadata"
                      className="w-full aspect-video bg-black"
                    />
                    {job.params && typeof job.params === "object" && "stylePreset" in job.params && (
                      <p className="px-3 py-2 type-caption text-muted [overflow-wrap:anywhere]">
                        {(job.params as Record<string, string>).stylePreset}
                      </p>
                    )}
                  </div>
                ) : null
              )}
            </div>
          </section>
        )}

        {publicPhotos.length > 0 && (
          <section>
            <SectionHeader title="Photos" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {publicPhotos.map((photo, i) =>
                photo.signedUrl ? (
                  <a
                    key={photo.id}
                    href={photo.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${photo.title} (opens the full photo)`}
                    className={`relative block aspect-square overflow-hidden focus-on-black ${
                      i % 2 === 0 ? "bg-yellow" : "bg-red"
                    }`}
                  >
                    <PrintedPhoto
                      tone={i % 2 === 0 ? "yellow" : "red"}
                      src={photo.signedUrl}
                      alt={photo.title}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  </a>
                ) : null
              )}
            </div>
          </section>
        )}

        {publicMusic.length > 0 && (
          <section>
            <SectionHeader title="Music" />
            <div className="flex flex-col gap-2">
              {publicMusic.map((track) => (
                <div key={track.id} className="bg-paper text-black border-2 border-black grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="type-title-sm text-black [overflow-wrap:anywhere]">{track.title}</p>
                    <p className="type-caption text-black mt-0.5">
                      {track.kind === "demo" ? "Demo" : "Instrumental"}
                      {track.duration_seconds != null && <> · {musicDuration(track.duration_seconds)}</>}
                    </p>
                  </div>
                  {track.signedUrl && (
                    <div className="grid gap-2 min-w-0 sm:grid-flow-col sm:items-center sm:gap-4">
                      <div className="bg-paper border-2 border-black p-1.5 min-w-0">
                        <audio
                          src={track.signedUrl}
                          controls
                          preload="none"
                          className="block h-10 w-full sm:w-64 max-w-full rounded-none"
                        />
                      </div>
                      <a
                        href={track.signedUrl}
                        download
                        className="type-label text-red underline underline-offset-4 inline-flex min-h-[44px] items-center focus-on-paper"
                      >
                        Download
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div>
          <Link
            href="/artists"
            className="type-label text-yellow underline underline-offset-4 inline-flex min-h-[44px] items-center focus-on-black"
          >
            All artists
          </Link>
        </div>
      </div>
    </>
  );
}
