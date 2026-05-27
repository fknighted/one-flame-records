import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import ReleaseCard from "@/components/ReleaseCard";
import VideoEmbed from "@/components/VideoEmbed";
import SectionHeader from "@/components/SectionHeader";
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

async function getArtist(slug: string) {
  const supabase = await createClient();
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
    <div className="space-y-4 text-ink/80 leading-relaxed text-[1.05rem]">
      {paras.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

export default async function ArtistDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

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

  // Generate signed URLs for public assets (files live in private-assets bucket)
  const assetsWithUrls = await Promise.all(
    (publicAssets ?? []).map(async (asset) => {
      const { data } = await service.storage
        .from("private-assets")
        .createSignedUrl(asset.storage_path, 3600);
      return { ...asset, signedUrl: data?.signedUrl ?? null };
    })
  );

  // Generate fresh signed URLs for generated videos (path is always videos/{id}.mp4)
  const jobsWithUrls = await Promise.all(
    (publicJobs ?? []).map(async (job) => {
      const { data } = await service.storage
        .from("generated-videos")
        .createSignedUrl(`videos/${job.id}.mp4`, 3600);
      return { ...job, videoUrl: data?.signedUrl ?? null };
    })
  );

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ── Hero ── */}
      <div className="relative w-full aspect-[2/1] sm:aspect-[3/1] bg-ink overflow-hidden">
        {artist.photo_url ? (
          <Image
            src={artist.photo_url}
            alt={artist.stage_name}
            fill
            className="object-cover object-top"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <svg viewBox="0 0 20 28" className="w-24 h-auto" aria-hidden="true">
              <path d="M10 1C10 1 4 9 4 16C4 19.8 6.3 23.1 10 25C13.7 23.1 16 19.8 16 16C16 9 10 1 10 1Z" fill="#ECE2C8" />
            </svg>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />

        {/* Name overlaid on gradient */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-6 sm:pb-8 max-w-6xl mx-auto">
          <h1 className="font-display font-bold text-bone text-[clamp(2rem,5vw,3.5rem)] leading-tight">
            {artist.stage_name}
          </h1>
          <p className="mt-1 text-bone/60 text-sm uppercase tracking-[0.12em]">
            {[artist.hometown, ...(artist.genres ?? [])].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 space-y-16">

        {/* Bio + links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {artist.bio && <BioParagraphs bio={artist.bio} />}
          </div>

          <div className="space-y-6">
            {/* Spotify compact embed */}
            {spotifyArtistEmbedUrl && (
              <iframe
                src={spotifyArtistEmbedUrl}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-lg"
              />
            )}

            {/* Streaming */}
            {activeStreaming.length > 0 && (
              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink/40 mb-3">
                  Stream
                </h3>
                <div className="flex flex-col gap-2">
                  {activeStreaming.map(({ key, label, buildUrl }) => (
                    <a
                      key={key}
                      href={buildUrl(streaming[key]!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-oxblood hover:text-ochre transition-colors font-medium"
                    >
                      {label} →
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Socials */}
            {activeSocials.length > 0 && (
              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink/40 mb-3">
                  Follow
                </h3>
                <div className="flex flex-col gap-2">
                  {activeSocials.map(({ key, label, buildUrl }) => (
                    <a
                      key={key}
                      href={buildUrl(socials[key]!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-oxblood hover:text-ochre transition-colors font-medium"
                    >
                      {label} →
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Releases */}
        {releases && releases.length > 0 && (
          <section>
            <SectionHeader title="Releases" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6">
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

        {/* Videos */}
        {videos && videos.length > 0 && (
          <section>
            <SectionHeader title="Videos" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((v, i) => (
                <VideoEmbed
                  key={v.id}
                  youtube_id={v.youtube_id}
                  title={v.title}
                  artist_name={v.artists?.stage_name ?? artist.stage_name}
                  priority={i === 0}
                />
              ))}
            </div>
          </section>
        )}

        {/* Generated Videos */}
        {jobsWithUrls.length > 0 && (
          <section>
            <SectionHeader title="Generated Videos" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobsWithUrls.map((job) =>
                job.videoUrl ? (
                  <div key={job.id} className="rounded-lg overflow-hidden border border-oxblood/10 bg-ink/5">
                    <video
                      src={job.videoUrl}
                      controls
                      preload="metadata"
                      className="w-full aspect-video bg-ink/20"
                    />
                    {job.params && typeof job.params === "object" && "stylePreset" in job.params && (
                      <p className="px-3 py-2 text-xs text-ink/50 truncate">
                        {(job.params as Record<string, string>).stylePreset}
                      </p>
                    )}
                  </div>
                ) : null
              )}
            </div>
          </section>
        )}

        {/* Photos */}
        {publicPhotos.length > 0 && (
          <section>
            <SectionHeader title="Photos" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {publicPhotos.map((photo) =>
                photo.signedUrl ? (
                  <a
                    key={photo.id}
                    href={photo.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-square rounded overflow-hidden bg-ink/10 hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={photo.signedUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </a>
                ) : null
              )}
            </div>
          </section>
        )}

        {/* Music */}
        {publicMusic.length > 0 && (
          <section>
            <SectionHeader title="Music" />
            <div className="flex flex-col divide-y divide-oxblood/10 border border-oxblood/10 rounded-lg overflow-hidden">
              {publicMusic.map((track) => (
                <div key={track.id} className="flex items-center gap-4 px-4 py-3 hover:bg-oxblood/5 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-ink font-medium text-sm truncate">{track.title}</p>
                    <p className="text-ink/40 text-xs mt-0.5">
                      {track.kind === "demo" ? "Demo" : "Instrumental"}
                      {track.duration_seconds != null && (
                        <> · {Math.floor(track.duration_seconds / 60)}:{String(track.duration_seconds % 60).padStart(2, "0")}</>
                      )}
                    </p>
                  </div>
                  {track.signedUrl && (
                    <div className="flex items-center gap-3 shrink-0">
                      <audio
                        src={track.signedUrl}
                        controls
                        preload="none"
                        className="h-8 w-44 sm:w-56"
                      />
                      <a
                        href={track.signedUrl}
                        download
                        className="text-xs text-oxblood hover:text-ochre transition-colors font-medium"
                      >
                        ↓
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Back link */}
        <div className="pt-4 border-t border-oxblood/10">
          <Link href="/artists" className="text-sm text-oxblood hover:text-ochre transition-colors">
            ← All artists
          </Link>
        </div>
      </div>
    </>
  );
}
