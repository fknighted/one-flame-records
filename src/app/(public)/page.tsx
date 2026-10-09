import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import ArtistCard from "@/components/ArtistCard";
import ReleaseCard from "@/components/ReleaseCard";
import VideoEmbed from "@/components/VideoEmbed";
import SectionHeader from "@/components/SectionHeader";
import LinkButton from "@/components/LinkButton";
import PrintedPhoto from "@/components/PrintedPhoto";
import GrilleBand from "@/components/GrilleBand";
import SpeakerRings from "@/components/SpeakerRings";
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

const NEWS_CATEGORY_LABEL: Record<string, string> = {
  label:   "Label",
  release: "Release",
  event:   "Event",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Public homepage — no per-user data, so read with the cookieless service
// client and serve as ISR. Every query below filters to public-only rows
// (active artists; releases/videos are public by RLS; published news), so the
// service client (which bypasses RLS) returns exactly what anon users may see.
export const revalidate = 120;

export default async function HomePage() {
  const supabase = createServiceClient();

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
        // Mirror the news_posts RLS SELECT policy exactly (is_published AND
        // published_at <= now) since the service client bypasses RLS. Excludes
        // null-dated posts, matching what anon users see today.
        .eq("is_published", true)
        .lte("published_at", new Date().toISOString())
        .order("published_at", { ascending: false })
        .limit(3)
        .returns<NewsPost[]>(),
    ]);

  return (
    <>
      {/* ── Hero: yellow poster block, grille band, printed live-room photo ── */}
      <section className="grid md:grid-cols-[1.15fr_1fr]">
        <div className="relative min-w-0 bg-yellow text-black px-4 sm:px-7 pt-10 pb-[82px] sm:pt-14 md:pr-[92px] md:pb-14">
          <h1 className="type-poster">
            Pressed in <span className="text-red">Montego</span> Bay.
          </h1>
          <p className="type-lead mt-5 max-w-[30ch]">
            Independent reggae and dancehall. We sign artists, not sounds.
          </p>
          <LinkButton href="/artists" variant="outline" ground="yellow" className="mt-8">
            Hear the roster
          </LinkButton>
          <GrilleBand className="absolute left-0 right-0 bottom-0 h-[42px] md:left-auto md:top-0 md:w-[60px] md:h-auto" />
        </div>
        <div className="relative min-h-[220px] sm:min-h-[260px] overflow-hidden">
          <PrintedPhoto
            tone="yellow"
            src="/hero-bg.jpg"
            alt="Live performance at an outdoor venue in Montego Bay"
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <SpeakerRings ground="photo" size={120} className="absolute right-2 top-2" />
        </div>
      </section>

      {/* ── The roster: colour tiles ── */}
      {featuredArtists && featuredArtists.length > 0 && (
        <section className="bg-black">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px]">
            <SectionHeader
              title="The roster"
              action={
                <Link href="/artists" className="type-label text-yellow underline underline-offset-4 focus-on-black">
                  All artists
                </Link>
              }
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 [&>*:last-child:nth-child(odd)]:col-span-2 [&>*:last-child:nth-child(odd)]:aspect-[2/1] lg:[&>*:last-child:nth-child(odd)]:col-span-1 lg:[&>*:last-child:nth-child(odd)]:aspect-square">
              {featuredArtists.map((artist, i) => (
                <ArtistCard
                  key={artist.id}
                  index={i}
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

      {/* ── Latest releases: small paper posters ── */}
      {releases && releases.length > 0 && (
        <section className="bg-black">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px] [.bg-black+.bg-black_&]:pt-0 sm:[.bg-black+.bg-black_&]:pt-0">
            <SectionHeader
              title="Latest releases"
              action={
                <Link href="/releases" className="type-label text-yellow underline underline-offset-4 focus-on-black">
                  All releases
                </Link>
              }
            />
            <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto pb-4 sm:pb-0 snap-x snap-mandatory">
              <div className="grid grid-flow-col sm:grid-flow-row sm:grid-cols-3 lg:grid-cols-6 gap-2 w-max sm:w-auto">
                {releases.map((release) => (
                  <div key={release.id} className="w-44 sm:w-auto min-w-0 snap-start">
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

      {/* ── Videos: thumbnails stay unprinted ── */}
      {videos && videos.length > 0 && (
        <section className="bg-black">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px] [.bg-black+.bg-black_&]:pt-0 sm:[.bg-black+.bg-black_&]:pt-0">
            <SectionHeader
              title="Latest videos"
              action={
                <Link href="/videos" className="type-label text-yellow underline underline-offset-4 focus-on-black">
                  All videos
                </Link>
              }
            />
            <div
              className={`grid grid-cols-1 gap-2 md:gap-4 ${
                videos.length === 1
                  ? "max-w-3xl"
                  : videos.length === 2
                    ? "md:grid-cols-2"
                    : "md:grid-cols-3"
              }`}
            >
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

      {/* ── Latest news: paper cards with a red tag band ── */}
      {newsPosts && newsPosts.length > 0 && (
        <section className="bg-black">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px] [.bg-black+.bg-black_&]:pt-0 sm:[.bg-black+.bg-black_&]:pt-0">
            <SectionHeader
              title="Latest news"
              action={
                <Link href="/news" className="type-label text-yellow underline underline-offset-4 focus-on-black">
                  All posts
                </Link>
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {newsPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/news/${post.slug}`}
                  className="group flex flex-col min-w-0 bg-paper text-black focus-on-black"
                >
                  <p className="bg-red text-paper px-3 py-2 type-label">
                    {NEWS_CATEGORY_LABEL[post.category] ?? post.category}
                  </p>
                  {post.cover_url && (
                    <div className="relative aspect-video overflow-hidden">
                      <PrintedPhoto
                        tone="red"
                        src={post.cover_url}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 p-3 gap-2 min-w-0">
                    <h3 className="type-title-sm line-clamp-3 [overflow-wrap:anywhere]">{post.title}</h3>
                    {post.excerpt && (
                      <p className="type-body-sm line-clamp-2 flex-1">{post.excerpt}</p>
                    )}
                  </div>
                  <div className="flex justify-between items-center gap-3 px-3 py-2.5 border-t-[3px] border-black type-small">
                    <span>{post.published_at ? formatDate(post.published_at) : ""}</span>
                    <span className="text-red underline underline-offset-4 group-hover:text-black">Read more</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Flames Lounge: red block. No real Lounge photos yet, so type and rings only ── */}
      <GrilleBand orientation="horizontal" holes="yellow" />
      <section className="bg-red text-paper">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2">
          <div className="min-w-0 px-4 sm:px-6 py-14 sm:py-[88px] grid gap-4 content-start">
            <h2 className="type-headline [overflow-wrap:anywhere]">Flames Lounge</h2>
            <p className="type-body font-medium max-w-[46ch]">
              Outdoor studio, gaming, Jamaican food and a bar. Walk-in welcome, no reservation needed.
            </p>
            <div>
              <LinkButton href="/flames-lounge" variant="primary" ground="red" className="mt-2">
                Visit the Lounge
              </LinkButton>
            </div>
          </div>
          <div className="hidden md:grid place-items-center px-6 py-10">
            <SpeakerRings ground="red" size={190} />
          </div>
        </div>
      </section>

      {/* ── Sign with One Flame: the form block on paper ── */}
      <section className="bg-paper text-black border-b-4 border-black">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px] grid gap-6 md:grid-cols-2 md:items-end">
          <div className="min-w-0">
            <h2 className="type-headline [overflow-wrap:anywhere]">Sign with One Flame.</h2>
            <span aria-hidden="true" className="section-bar mt-2" />
            <p className="type-body mt-4 max-w-[46ch]">
              You keep your publishing. We handle the platform.
            </p>
          </div>
          <div className="min-w-0 md:justify-self-end">
            {/* The footer directly below carries the newsletter form, so this block holds only the sign-up action. */}
            <LinkButton href="/sign" variant="dark" ground="paper">Sign with us</LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
