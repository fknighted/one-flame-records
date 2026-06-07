import Link from "next/link";
import Image from "next/image";
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

type NewsPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  category: string;
  published_at: string | null;
};

const NEWS_CATEGORY_PILL: Record<string, string> = {
  label:   "bg-oxblood/10 text-oxblood",
  release: "bg-forest/10 text-forest",
  event:   "bg-ochre/10 text-ochre",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: featuredArtists }, { data: releases }, { data: videos }, { data: newsPosts }] =
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

      supabase
        .from("news_posts")
        .select("id, slug, title, excerpt, cover_url, category, published_at")
        .eq("is_published", true)
        .or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`)
        .order("published_at", { ascending: false })
        .limit(3)
        .returns<NewsPost[]>(),
    ]);

  return (
    <>
      {/* ── Hero — full-bleed photo ── */}
      <section className="relative overflow-hidden bg-ink">
        {/* Full-bleed hero photo */}
        <Image
          src="/hero-bg.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Dark overlay — ink at 72% opacity for legibility */}
        <div aria-hidden="true" className="absolute inset-0" style={{ backgroundColor: "rgba(26,22,18,0.72)" }} />
        {/* Radial oxblood glow on top of overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 30% 60%, rgba(139,42,31,0.28) 0%, transparent 70%)",
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
            <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto pb-4 sm:pb-0 snap-x snap-mandatory">
              <div className="grid grid-flow-col sm:grid-flow-row sm:grid-cols-3 lg:grid-cols-6 gap-5 w-max sm:w-auto">
                {releases.map((release) => (
                  <div key={release.id} className="w-44 sm:w-auto snap-start">
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
                  storage_url={video.storage_url}
                  title={video.title}
                  artist_name={video.artists?.stage_name ?? ""}
                  priority={i === 0}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Latest News — cream ── */}
      {newsPosts && newsPosts.length > 0 && (
        <section className="bg-cream">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
            <SectionHeader
              eyebrow="From the Label"
              title="Latest News"
              action={
                <Link href="/news" className="text-sm text-oxblood/60 hover:text-ochre transition-colors">
                  All posts →
                </Link>
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {newsPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/news/${post.slug}`}
                  className="group flex flex-col rounded-lg overflow-hidden border border-oxblood/10 hover:border-oxblood/30 transition-colors bg-white/50"
                >
                  <div className="relative aspect-video bg-ink/5 overflow-hidden">
                    {post.cover_url ? (
                      <Image
                        src={post.cover_url}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <svg viewBox="0 0 20 28" className="w-8 h-auto" aria-hidden="true">
                          <path d="M10 1C10 1 4 9 4 16C4 19.8 6.3 23.1 10 25C13.7 23.1 16 19.8 16 16C16 9 10 1 10 1Z" fill="#8B2A1F" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 p-4 gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider capitalize ${NEWS_CATEGORY_PILL[post.category] ?? "bg-ink/10 text-ink"}`}>
                        {post.category}
                      </span>
                      {post.published_at && (
                        <span className="text-[11px] text-ink/40">{formatDate(post.published_at)}</span>
                      )}
                    </div>
                    <h3 className="font-display font-semibold text-ink text-base leading-snug group-hover:text-oxblood transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-ink/60 text-sm leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>
                    )}
                    <span className="mt-1 text-xs font-medium text-oxblood group-hover:text-ochre transition-colors">
                      Read more →
                    </span>
                  </div>
                </Link>
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
