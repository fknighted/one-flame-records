import { assertPublicReads } from "@/lib/public-data";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import ReleaseCard from "@/components/ReleaseCard";
import VideoEmbed from "@/components/VideoEmbed";
import SectionHeader from "@/components/SectionHeader";
import LinkButton from "@/components/LinkButton";
import PrintedPhoto from "@/components/PrintedPhoto";
import GrilleBand from "@/components/GrilleBand";
import { tooLong } from "@/lib/sound-system";
import styles from "./home.module.css";
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

export const metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const supabase = createServiceClient();

  const results =
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

  assertPublicReads(...results);
  const [{data:featuredArtists},{data:releases},{data:videos},{data:newsPosts}]=results;

  const leadVideo = videos?.[0];
  const moreVideos = videos?.slice(1) ?? [];

  return (
    <>
      <section className="bg-black text-paper border-b-4 border-yellow" aria-labelledby="home-title">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 sm:pt-14 pb-10 sm:pb-14">
          <h1 id="home-title" className={`font-poster font-black uppercase ${styles.masthead}`}>
            <span className={styles.intro}>Pressed in</span>
            <span className="block text-yellow">Montego Bay.</span>
          </h1>
          <div className={styles.heroBody}>
            <div className="min-w-0">
              <p className="type-lead max-w-[28ch]">Independent reggae and dancehall.</p>
              <p className="type-body text-muted mt-3 max-w-[28ch]">We sign artists, not sounds.</p>
              <LinkButton href="/artists" variant="primary" ground="black" className="mt-7">
                Hear the roster
              </LinkButton>
            </div>
            <figure className="min-w-0">
              <div className="relative aspect-[16/8] sm:aspect-[16/7] bg-yellow">
                <PrintedPhoto
                  tone="yellow"
                  src="/hero-bg.jpg"
                  alt="Live performance at an outdoor venue in Montego Bay"
                  fill
                  priority
                  className="object-cover object-[50%_58%]"
                  sizes="(max-width: 767px) 100vw, 750px"
                />
              </div>
              <figcaption className="type-small text-muted mt-3">One Flame Records. Montego Bay, Jamaica.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {leadVideo && (
        <section id="music" className="bg-red text-paper" aria-labelledby="featured-video-title">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.4fr] lg:items-center">
              <div className="min-w-0">
                <p className="type-label mb-5">Latest video</p>
                <h2 id="featured-video-title" className={`${tooLong(leadVideo.title) ? "type-title" : "type-headline"} [overflow-wrap:anywhere]`}>
                  {leadVideo.title}
                </h2>
                {leadVideo.artists?.stage_name && <p className="type-lead mt-5">{leadVideo.artists.stage_name}</p>}
                <Link href="/videos" className="inline-flex items-center min-h-[46px] mt-6 type-label underline underline-offset-4 focus-on-red hover:decoration-yellow hover:decoration-2">
                  All videos
                </Link>
              </div>
              <div className="min-w-0 border-4 border-black bg-black">
                <VideoEmbed
                  youtube_id={leadVideo.youtube_id}
                  storage_url={leadVideo.storage_url}
                  title={leadVideo.title}
                  artist_name={leadVideo.artists?.stage_name ?? ""}
                  priority
                  showCaption={false}
                  poster={
                    leadVideo.storage_url?.endsWith("/videos/ac45c5ce-9554-45cc-9c4f-cbe756dd47cb.mp4")
                      ? "/speechless-kahlic-poster.jpg"
                      : undefined
                  }
                />
              </div>
            </div>
            {moreVideos.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-6 mt-10 p-4 bg-black">
                {moreVideos.map(video => (
                  <VideoEmbed key={video.id} youtube_id={video.youtube_id} storage_url={video.storage_url}
                    title={video.title} artist_name={video.artists?.stage_name ?? ""} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {featuredArtists && featuredArtists.length > 0 && (
        <section className="bg-black text-paper" aria-labelledby="roster-title">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px] grid gap-8 lg:grid-cols-[0.65fr_1.55fr]">
            <div className="min-w-0">
              <h2 id="roster-title" className="type-headline">The roster</h2>
              <span className="section-bar mt-3" aria-hidden="true" />
              <Link href="/artists" className="inline-flex items-center min-h-[46px] mt-5 type-label text-yellow underline underline-offset-4 focus-on-black hover:text-paper">
                All artists
              </Link>
            </div>
            <ul className="grid min-[375px]:grid-cols-2 gap-x-5 sm:gap-x-8 min-w-0" aria-label="Featured artists">
              {featuredArtists.map(artist => (
                <li key={artist.id} className="min-w-0 border-t-2 border-line">
                  <Link href={`/artists/${artist.slug}`} className="group flex min-h-[88px] sm:min-h-[104px] items-center gap-4 py-4 focus-on-black hover:text-yellow">
                    {artist.photo_url && (
                      <div className="relative w-16 h-16 shrink-0 bg-yellow">
                        <PrintedPhoto tone="yellow" src={artist.photo_url} alt="" fill className="object-cover" sizes="64px" />
                      </div>
                    )}
                    <span className="block min-w-0">
                      <span className={`block font-poster font-extrabold uppercase ${styles.rosterName}`}>{artist.stage_name}</span>
                      {artist.hometown && <span className="block type-small text-muted mt-2">{artist.hometown}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
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

      <GrilleBand orientation="horizontal" holes="yellow" />
      <section aria-labelledby="lounge-title" className="grid lg:grid-cols-2">
        <div className="bg-yellow text-black">
          <div className={`px-4 sm:px-6 py-12 sm:py-16 ${styles.loungeLeft}`}>
            <h2 id="lounge-title" className={`font-poster font-black uppercase ${styles.loungeTitle}`}>
              <span className="block">Flames</span><span className="block">Lounge.</span>
            </h2>
            <p className="type-body mt-6 max-w-[30ch]">Walk-in welcome, no reservation needed.</p>
            <LinkButton href="/flames-lounge" variant="outline" ground="yellow" className="mt-7">Visit the Lounge</LinkButton>
          </div>
        </div>
        <div className="bg-red text-paper">
          <div className={`px-4 sm:px-6 py-10 sm:py-16 ${styles.loungeRight}`}>
            <ul aria-label="At Flames Lounge" className="divide-y-2 divide-paper/30">
              {["Outdoor studio", "Gaming", "Jamaican food", "Bar"].map(offering => (
                <li key={offering} className="py-5 first:pt-0 last:pb-0 type-title">{offering}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-black text-paper" aria-labelledby="join-title">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px] grid gap-8 md:grid-cols-[1.3fr_0.7fr] md:items-end">
          <h2 id="join-title" className={`font-poster font-black uppercase ${styles.joinTitle}`}>
            Sign with<br /><span className="text-yellow">One Flame.</span>
          </h2>
          <div className="min-w-0 md:pb-2">
            <p className="type-lead max-w-[28ch]">You keep your publishing. We handle the platform.</p>
            <LinkButton href="/sign" variant="primary" ground="black" className="mt-7">Sign with us</LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
