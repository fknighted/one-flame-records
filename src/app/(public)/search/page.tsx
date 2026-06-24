import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <>
      {/* Ink banner */}
      <section className="bg-ink">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-14 pb-10">
          <h1 className="font-display font-bold text-bone text-[clamp(2rem,5vw,3rem)] leading-tight mb-6">
            Search
          </h1>
          <form method="GET" action="/search">
            <div className="flex gap-2">
              <input
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Artists, releases, news…"
                autoFocus
                className="flex-1 bg-bone/10 border border-bone/20 rounded-lg px-4 py-3 text-bone placeholder:text-bone/30 focus:outline-none focus:border-ochre/60 text-base"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-ochre text-ink font-semibold rounded-lg hover:bg-ochre/90 transition-colors text-sm"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="bg-cream">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 space-y-10">

          {!query && (
            <p className="text-ink/40 text-sm text-center py-12">
              Type at least 2 characters to search.
            </p>
          )}

          {query.length >= 2 && totalResults === 0 && (
            <p className="text-ink/40 text-sm text-center py-12">
              No results for <strong className="text-ink">&ldquo;{query}&rdquo;</strong>.
            </p>
          )}

          {/* Artists */}
          {artists.length > 0 && (
            <div>
              <h2 className="font-display text-lg font-semibold text-ink mb-4">Artists</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {artists.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/artists/${a.slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-oxblood/10 hover:border-oxblood/30 hover:bg-white/40 transition-colors"
                  >
                    {a.photo_url ? (
                      <Image src={a.photo_url} alt={a.stage_name} width={40} height={40} className="rounded-full object-cover w-10 h-10 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-oxblood/10 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-ink text-sm truncate">{a.stage_name}</p>
                      {a.hometown && <p className="text-ink/50 text-xs">{a.hometown}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Releases */}
          {releases.length > 0 && (
            <div>
              <h2 className="font-display text-lg font-semibold text-ink mb-4">Releases</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {releases.map((r) => {
                  const artist = Array.isArray(r.artists) ? r.artists[0] : r.artists;
                  return (
                    <Link
                      key={r.slug}
                      href={`/releases/${r.slug}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-oxblood/10 hover:border-oxblood/30 hover:bg-white/40 transition-colors"
                    >
                      {r.cover_url ? (
                        <Image src={r.cover_url} alt={r.title} width={40} height={40} className="rounded object-cover w-10 h-10 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-oxblood/10 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-ink text-sm truncate">{r.title}</p>
                        <p className="text-ink/50 text-xs capitalize">{r.type}{artist?.stage_name ? ` · ${artist.stage_name}` : ""}</p>
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
              <h2 className="font-display text-lg font-semibold text-ink mb-4">News</h2>
              <div className="space-y-3">
                {posts.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/news/${p.slug}`}
                    className="flex items-start gap-3 p-3 rounded-lg border border-oxblood/10 hover:border-oxblood/30 hover:bg-white/40 transition-colors"
                  >
                    {p.cover_url && (
                      <Image src={p.cover_url} alt={p.title} width={64} height={40} className="rounded object-cover w-16 h-10 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-ink text-sm leading-snug">{p.title}</p>
                      {p.excerpt && <p className="text-ink/50 text-xs mt-0.5 line-clamp-1">{p.excerpt}</p>}
                      {p.published_at && <p className="text-ink/30 text-xs mt-0.5">{formatDate(p.published_at)}</p>}
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
