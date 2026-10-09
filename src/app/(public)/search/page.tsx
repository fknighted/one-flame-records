import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import PosterHeadline from "@/components/PosterHeadline";
import PrintedPhoto from "@/components/PrintedPhoto";
import EmptyState from "@/components/EmptyState";
import { FIELD_CLASS, FIELD_LABEL_CLASS, buttonClasses } from "@/lib/sound-system";

export const metadata: Metadata = {
  title: "Search — One Flame Records",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const supabase = await createClient();
  const now = new Date().toISOString();

  let artists: Array<{ slug: string; stage_name: string; photo_url: string | null; hometown: string | null }> = [];
  let releases: Array<{ slug: string; title: string; cover_url: string; type: string; artists: { stage_name: string } | null }> = [];
  let posts: Array<{ slug: string; title: string; excerpt: string | null; cover_url: string | null; published_at: string | null }> = [];

  if (query.length >= 2) {
    const pattern = `%${query}%`;

    const [{ data: a }, { data: r }, { data: p }] = await Promise.all([
      supabase
        .from("artists")
        .select("slug, stage_name, photo_url, hometown")
        .eq("status", "active")
        .ilike("stage_name", pattern)
        .order("stage_name")
        .limit(8),
      supabase
        .from("releases")
        .select("slug, title, cover_url, type, artists(stage_name)")
        .ilike("title", pattern)
        .order("release_date", { ascending: false })
        .limit(8),
      supabase
        .from("news_posts")
        .select("slug, title, excerpt, cover_url, published_at")
        .eq("is_published", true)
        .or(`published_at.is.null,published_at.lte.${now}`)
        .or(`title.ilike.${pattern},excerpt.ilike.${pattern}`)
        .order("published_at", { ascending: false })
        .limit(8),
    ]);

    artists  = (a ?? []) as typeof artists;
    releases = (r ?? []) as typeof releases;
    posts    = (p ?? []) as typeof posts;
  }

  const totalResults = artists.length + releases.length + posts.length;

  // Result rows: paper on black, so the black focus ring sits outside them.
  const ROW = "flex items-center gap-3 p-3 min-w-0 bg-paper text-black hover:bg-yellow transition-colors focus-on-black";

  return (
    <>
      {/* Header and search form */}
      <section className="bg-black">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-14 pb-10 sm:pt-[88px]">
          <PosterHeadline as="h1" size="headline" className="text-paper">
            Search
          </PosterHeadline>
          <span aria-hidden="true" className="section-bar mt-2 mb-8" />
          {/* Forms sit on paper */}
          <form method="GET" action="/search" className="bg-paper text-black p-4 sm:p-5">
            <label htmlFor="search-q" className={FIELD_LABEL_CLASS}>
              Search artists, releases and news
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                id="search-q"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Artists, releases, news…"
                autoFocus
                className={`${FIELD_CLASS} flex-[1_1_180px] min-w-0 appearance-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:appearance-none`}
              />
              <button type="submit" className={buttonClasses("dark", "paper", "shrink-0")}>
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="bg-black">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-14 sm:pb-[88px] space-y-10">

          {query.length < 2 && (
            <EmptyState
              title={query ? "Type at least 2 letters." : "What are you looking for?"}
              body="Search by artist name, release title or news headline."
            />
          )}

          {query.length >= 2 && totalResults === 0 && (
            <EmptyState
              title="No results."
              body={`Nothing matched \u201c${query}\u201d. Try a different spelling or fewer letters.`}
            />
          )}

          {/* Artists */}
          {artists.length > 0 && (
            <div>
              <h2 className="type-title text-paper">Artists</h2>
              <span aria-hidden="true" className="section-bar mt-2 mb-5" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {artists.map((a) => (
                  <Link key={a.slug} href={`/artists/${a.slug}`} className={ROW}>
                    {a.photo_url ? (
                      <PrintedPhoto tone="yellow" src={a.photo_url} alt={a.stage_name} width={48} height={48} className="object-cover w-12 h-12 shrink-0" />
                    ) : (
                      <span aria-hidden="true" className="grid place-items-center w-12 h-12 shrink-0 bg-red text-paper type-title-sm">
                        {a.stage_name.charAt(0)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="type-title-sm truncate">{a.stage_name}</p>
                      {a.hometown && <p className="type-small mt-1">{a.hometown}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Releases: cover art is artwork, so it is not printed */}
          {releases.length > 0 && (
            <div>
              <h2 className="type-title text-paper">Releases</h2>
              <span aria-hidden="true" className="section-bar mt-2 mb-5" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {releases.map((r) => {
                  const artist = Array.isArray(r.artists) ? r.artists[0] : r.artists;
                  return (
                    <Link key={r.slug} href={`/releases/${r.slug}`} className={ROW}>
                      {r.cover_url ? (
                        <Image src={r.cover_url} alt={r.title} width={48} height={48} className="object-cover w-12 h-12 shrink-0" />
                      ) : (
                        <span aria-hidden="true" className="w-12 h-12 shrink-0 bg-red" />
                      )}
                      <div className="min-w-0">
                        <p className="type-title-sm truncate">{r.title}</p>
                        <p className="type-small mt-1 capitalize [overflow-wrap:anywhere]">{r.type}{artist?.stage_name ? ` · ${artist.stage_name}` : ""}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* News */}
          {posts.length > 0 && (
            <div>
              <h2 className="type-title text-paper">News</h2>
              <span aria-hidden="true" className="section-bar mt-2 mb-5" />
              <div className="grid gap-2">
                {posts.map((p) => (
                  <Link key={p.slug} href={`/news/${p.slug}`} className={`${ROW} items-start`}>
                    {p.cover_url && (
                      <PrintedPhoto tone="red" src={p.cover_url} alt={p.title} width={80} height={48} className="object-cover w-20 h-12 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="type-title-sm [overflow-wrap:anywhere]">{p.title}</p>
                      {p.excerpt && <p className="type-body-sm mt-1 line-clamp-1">{p.excerpt}</p>}
                      {p.published_at && <p className="type-caption mt-1">{formatDate(p.published_at)}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>
    </>
  );
}
