import { assertPublicReads } from "@/lib/public-data";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import ReleaseCard from "@/components/ReleaseCard";
import VideoEmbed from "@/components/VideoEmbed";
import SectionHeader from "@/components/SectionHeader";
import LinkButton from "@/components/LinkButton";
import PrintedPhoto from "@/components/PrintedPhoto";
import GrilleBand from "@/components/GrilleBand";
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
      {/* Taste 2.5.1 film hero: native template composition adapted to One Flame's
          solid text blocks, typography and exact palette; see v3/plan.md. */}
      <section className={`hero hero--film ${styles.tasteHero}`} aria-labelledby="home-title">
        <div className={`wrap mx-auto max-w-6xl px-4 sm:px-6 ${styles.filmGrid}`}>
          <div className="hero-text min-w-0">
            <p className="type-small mb-5">Montego Bay, Jamaica.</p>
            <h1 id="home-title" className={`font-poster font-black uppercase ${styles.filmTitle}`}>Reggae and dancehall.</h1>
            <p className="hero__lead type-lead mt-6 max-w-[30ch]">An independent label in Montego Bay, Jamaica.</p>
            <LinkButton href="/artists" variant="outline" ground="yellow" className="mt-7">Hear the roster</LinkButton>
          </div>
          <div className="hero__media min-w-0">
            {leadVideo ? (
              <>
                <div className={styles.cinemaFrame}>
                  <VideoEmbed youtube_id={leadVideo.youtube_id} storage_url={leadVideo.storage_url}
                    title={leadVideo.title} artist_name={leadVideo.artists?.stage_name ?? ""}
                    priority showCaption={false}
                    poster={leadVideo.storage_url?.endsWith("/videos/ac45c5ce-9554-45cc-9c4f-cbe756dd47cb.mp4") ? "/speechless-kahlic-poster.jpg" : undefined} />
                </div>
                <div className="hero__over flex flex-wrap items-end justify-between gap-4 mt-4">
                  <div className="min-w-0">
                    <p className="type-title [overflow-wrap:anywhere]">{leadVideo.title}</p>
                    {leadVideo.artists?.stage_name && <p className="type-body-sm mt-1">{leadVideo.artists.stage_name}</p>}
                  </div>
                  <Link href="/videos" className="inline-flex items-center min-h-[46px] type-label underline underline-offset-4 focus-on-yellow hover:decoration-2">All videos</Link>
                </div>
              </>
            ) : (
              <div className="relative aspect-[4/3] bg-black">
                <PrintedPhoto tone="yellow" src="/hero-bg.jpg" alt="Live performance at an outdoor venue in Montego Bay" fill priority className="object-cover" sizes="(max-width: 767px) 100vw, 700px" />
              </div>
            )}
          </div>
        </div>
      </section>

      {featuredArtists && featuredArtists.length > 0 && (
        <section className="bg-black text-paper" aria-label="The roster">
          <div className="wrap mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px]">
            <SectionHeader title="The roster" action={<Link href="/artists" className="inline-flex items-center min-h-[46px] type-label text-yellow underline underline-offset-4 focus-on-black hover:text-paper">All artists</Link>} />
            <div className={styles.rosterGrid}>
              <ul className={`rows ${styles.artistRows}`} aria-label="Featured artists">
                {featuredArtists.map(artist => (
                  <li key={artist.id}>
                    <Link href={`/artists/${artist.slug}`} className="flex items-center justify-between gap-4 py-4 min-h-[64px] border-b border-line focus-on-black hover:text-yellow">
                      <span className={`rows__name font-poster font-extrabold uppercase ${styles.artistName}`}>{artist.stage_name}</span>
                      {artist.hometown && <span className="type-small text-muted text-right shrink-0 max-w-[12ch]">{artist.hometown}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="min-w-0">
                <div className="frame frame--photo relative aspect-[4/3] bg-yellow">
                  <PrintedPhoto tone="yellow" src="/hero-bg.jpg" alt="Live performance at an outdoor venue in Montego Bay" fill className="object-cover" sizes="(max-width: 767px) 100vw, 600px" />
                </div>
                <p className="type-lead mt-6 max-w-[32ch]">We sign artists, not sounds.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {moreVideos.length > 0 && (
        <section className="bg-black text-paper">
          <div className="wrap mx-auto max-w-6xl px-4 sm:px-6 pb-14 sm:pb-[88px]">
            <SectionHeader title="More videos" />
            <div className="grid sm:grid-cols-2 gap-6">
              {moreVideos.map(video => <VideoEmbed key={video.id} youtube_id={video.youtube_id} storage_url={video.storage_url} title={video.title} artist_name={video.artists?.stage_name ?? ""} />)}
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
      <section className="bg-red text-paper" aria-labelledby="lounge-title">
        <div className="wrap mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="min-w-0">
              <h2 id="lounge-title" className="type-headline">Flames Lounge</h2>
              <p className="type-body mt-6">Walk-in welcome, no reservation needed.</p>
            </div>
            <LinkButton href="/flames-lounge" variant="primary" ground="red">Visit the Lounge</LinkButton>
          </div>
          <ul className={styles.offerRows} aria-label="At Flames Lounge">
            {["Outdoor studio", "Gaming", "Jamaican food", "Bar"].map(offering => <li key={offering} className="type-title">{offering}</li>)}
          </ul>
        </div>
      </section>

      <section className={`closing close--type bg-paper text-black ${styles.tasteClose}`} aria-labelledby="join-title">
        <div className="wrap mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px]">
          <h2 id="join-title" className="type-headline">Sign with One Flame.</h2>
          <p className="type-body mt-6 max-w-[42ch]">You keep your publishing. We handle the platform.</p>
          <LinkButton href="/sign" variant="dark" ground="paper" className={`mt-8 ${styles.closeButton}`}>Sign with us</LinkButton>
        </div>
      </section>
    </>
  );
}
