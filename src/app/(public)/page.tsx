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
      {/* ── Hero ── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-oxblood/60 mb-4">
          Montego Bay · Jamaica
        </p>
        <h1 className="font-display font-bold text-oxblood text-[clamp(2.75rem,6vw,4.5rem)] leading-[1.05] tracking-tight max-w-3xl">
          Pressed in Montego Bay.
        </h1>
        <div className="mt-5 h-px w-24 bg-oxblood" />
        <p className="mt-5 text-lg text-ink/70 max-w-xl leading-relaxed">
          One Flame Records is an independent reggae and dancehall label rooted in
          the tradition of Jamaican music — artists, releases, and the culture they carry.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/artists"
            className="inline-block rounded bg-oxblood px-6 py-2.5 text-sm font-semibold text-bone hover:bg-ochre transition-colors"
          >
            Our Artists
          </Link>
          <Link
            href="/releases"
            className="inline-block rounded border border-oxblood px-6 py-2.5 text-sm font-semibold text-oxblood hover:bg-oxblood hover:text-bone transition-colors"
          >
            New Releases
          </Link>
        </div>
      </section>

      {/* ── Featured Artists ── */}
      {featuredArtists && featuredArtists.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 border-t border-oxblood/10">
          <SectionHeader
            eyebrow="The Roster"
            title="Featured Artists"
            action={
              <Link href="/artists" className="text-sm text-oxblood underline underline-offset-4 hover:text-ochre transition-colors">
                Full roster
              </Link>
            }
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
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
        </section>
      )}

      {/* ── Latest Releases ── */}
      {releases && releases.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 border-t border-oxblood/10">
          <SectionHeader
            eyebrow="Discography"
            title="Latest Releases"
            action={
              <Link href="/releases" className="text-sm text-oxblood underline underline-offset-4 hover:text-ochre transition-colors">
                All releases
              </Link>
            }
          />
          {/* Horizontal scroll on mobile, grid on sm+ */}
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
        </section>
      )}

      {/* ── Videos ── */}
      {videos && videos.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 border-t border-oxblood/10">
          <SectionHeader
            eyebrow="Watch"
            title="Latest Videos"
            action={
              <Link href="/videos" className="text-sm text-oxblood underline underline-offset-4 hover:text-ochre transition-colors">
                All videos
              </Link>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </section>
      )}

      {/* ── Sign with One Flame CTA ── */}
      <section className="bg-oxblood mt-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display font-bold text-bone text-3xl leading-tight">
              Sign with One Flame.
            </h2>
            <p className="mt-2 text-bone/70 max-w-md">
              We work with artists who have something real to say. If that&apos;s you,
              we want to hear it.
            </p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 inline-block rounded bg-ochre px-7 py-3 text-sm font-semibold text-ink hover:bg-bone transition-colors"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </>
  );
}
