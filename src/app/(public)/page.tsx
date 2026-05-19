import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ArtistCard from "@/components/ArtistCard";
import ReleaseCard from "@/components/ReleaseCard";
import VideoEmbed from "@/components/VideoEmbed";
import SectionHeader from "@/components/SectionHeader";
import type { Tables } from "@/types/supabase";

type ReleaseRow = Tables<"releases"> & {
  artists: { stage_name: string; slug: string } | null;
};

type VideoRow = Tables<"videos"> & {
  artists: { stage_name: string } | null;
};

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: featuredArtists }, { data: releases }, { data: videos }] =
    await Promise.all([
      supabase
        .from("artists")
        .select("id, slug, stage_name, photo_url, hometown, featured_order")
        .eq("status", "active")
        .not("featured_order", "is", null)
        .order("featured_order", { ascending: true }),

      supabase
        .from("releases")
        .select("*, artists(stage_name, slug)")
        .order("release_date", { ascending: false })
        .limit(6)
        .returns<ReleaseRow[]>(),

      supabase
        .from("videos")
        .select("*, artists(stage_name)")
        .order("featured", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(3)
        .returns<VideoRow[]>(),
    ]);

  return (
    <>
      {/* ── Hero — full-bleed dark ── */}
      <section className="relative bg-ink overflow-hidden">
        {/* Radial oxblood glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 30% 60%, rgba(139,42,31,0.22) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-24 pb-28 md:pt-32 md:pb-36 min-h-[75vh] flex flex-col justify-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-forest mb-5">
            Montego Bay · Jamaica
          </p>
          <h1 className="font-display font-bold text-bone text-[clamp(3rem,7vw,5.5rem)] leading-[1.02] tracking-tight max-w-3xl">
            Pressed in<br />Montego Bay.
          </h1>
          <div className="mt-6 h-px w-24 bg-oxblood" />
          <p className="mt-6 text-lg text-bone/60 max-w-lg leading-relaxed">
            One Flame Records is an independent reggae and dancehall label rooted in
            the tradition of Jamaican music — artists, releases, and the culture they carry.
          </p>
          <div className="mt-10 flex items-center gap-4">
            <Link
              href="/artists"
              className="inline-block rounded bg-ochre px-7 py-3 text-sm font-semibold text-ink hover:bg-bone transition-colors"
            >
              Our Artists
            </Link>
            <Link
              href="/releases"
              className="inline-block rounded border border-bone/30 px-7 py-3 text-sm font-semibold text-bone hover:border-bone hover:bg-bone/5 transition-colors"
            >
              New Releases
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Artists — ink ── */}
      {featuredArtists && featuredArtists.length > 0 && (
        <section className="bg-ink">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
            <SectionHeader
              dark
              eyebrow="The Roster"
              title="Featured Artists"
              action={
                <Link href="/artists" className="text-sm text-bone/40 hover:text-ochre transition-colors">
                  Full roster →
                </Link>
              }
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-1.5">
              {featuredArtists.map((artist) => (
                <ArtistCard
                  key={artist.id}
                  slug={artist.slug}
                  stage_name={artist.stage_name}
                  photo_url={artist.photo_url}
                  hometown={artist.hometown}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Latest Releases — cream ── */}
      {releases && releases.length > 0 && (
        <section className="bg-cream">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
            <SectionHeader
              eyebrow="Discography"
              title="Latest Releases"
              action={
                <Link href="/releases" className="text-sm text-oxblood/60 hover:text-ochre transition-colors">
                  All releases →
                </Link>
              }
            />
            <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto pb-4 sm:pb-0">
              <div className="grid grid-flow-col sm:grid-flow-row sm:grid-cols-3 lg:grid-cols-6 gap-5 w-max sm:w-auto">
                {releases.map((release) => (
                  <div key={release.id} className="w-44 sm:w-auto">
                    <ReleaseCard
                      slug={release.slug}
                      title={release.title}
                      cover_url={release.cover_url}
                      release_date={release.release_date}
                      type={release.type}
                      artist_name={release.artists?.stage_name ?? ""}
                      artist_slug={release.artists?.slug ?? ""}
                      streaming_links={(release.streaming_links as Record<string, string>) ?? {}}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Videos — ink ── */}
      {videos && videos.length > 0 && (
        <section className="bg-ink">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
            <SectionHeader
              dark
              eyebrow="Watch"
              title="Latest Videos"
              action={
                <Link href="/videos" className="text-sm text-bone/40 hover:text-ochre transition-colors">
                  All videos →
                </Link>
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {videos.map((video, i) => (
                <VideoEmbed
                  key={video.id}
                  youtube_id={video.youtube_id}
                  title={video.title}
                  artist_name={video.artists?.stage_name ?? ""}
                  priority={i === 0}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Sign with One Flame CTA ── */}
      <section className="bg-oxblood">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-bone/50 mb-3">
              Montego Bay · Jamaica
            </p>
            <h2 className="font-display font-bold text-bone text-[clamp(2rem,4vw,3rem)] leading-tight">
              Sign with One Flame.
            </h2>
            <p className="mt-3 text-bone/70 max-w-md leading-relaxed">
              We work with artists who have something real to say. If that's you,
              we want to hear it.
            </p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 inline-block rounded bg-bone px-8 py-3.5 text-sm font-semibold text-ink hover:bg-ochre transition-colors"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </>
  );
}
