import Link from "next/link";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import SectionHeader from "@/components/SectionHeader";
import EmptyState from "@/components/EmptyState";
import LinkButton from "@/components/LinkButton";
import LogoMark from "@/components/LogoMark";
import PrintedPhoto from "@/components/PrintedPhoto";

export const metadata: Metadata = {
  title: "News — One Flame Records",
  description: "Latest news, releases, and events from One Flame Records.",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const PAGE_SIZE = 9;

// This page renders dynamically (it reads searchParams for pagination), so we
// cache each page slice via the cookieless service client. The filter mirrors
// the news_posts RLS SELECT policy exactly (is_published AND published_at<=now)
// since the service client bypasses RLS; `now` is frozen per revalidate window.
const getNewsPage = unstable_cache(
  async (from: number, to: number) => {
    const supabase = createServiceClient();
    const now = new Date().toISOString();
    const { data: posts, count } = await supabase
      .from("news_posts")
      .select("id, slug, title, excerpt, cover_url, category, published_at", { count: "exact" })
      .eq("is_published", true)
      .lte("published_at", now)
      .order("published_at", { ascending: false })
      .range(from, to);
    return { posts: posts ?? [], count: count ?? 0 };
  },
  ["public-news-list"],
  { revalidate: 120 }
);

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to   = from + PAGE_SIZE - 1;

  const { posts, count } = await getNewsPage(from, to);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <>
      {/* ── Page banner ── */}
      <section className="bg-black">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 sm:pt-[88px] pb-2">
          <SectionHeader as="h1" title="News" />
        </div>
      </section>

      {/* ── Posts grid ── */}
      <section className="bg-black">
        <div className={`mx-auto max-w-6xl px-4 sm:px-6 py-14 ${posts && posts.length > 0 ? "sm:py-[88px]" : ""}`}>
          {posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {posts.map((post, i) => {
                const tone = i % 2 === 0 ? "yellow" : "red";
                return (
                  <Link
                    key={post.id}
                    href={`/news/${post.slug}`}
                    className="group flex flex-col min-w-0 bg-paper text-black focus-on-paper"
                  >
                    <div className="relative aspect-video bg-black overflow-hidden">
                      {post.cover_url ? (
                        <PrintedPhoto
                          tone={tone}
                          src={post.cover_url}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className={`absolute inset-0 grid place-items-center ${tone === "yellow" ? "bg-yellow" : "bg-red"}`}>
                          <LogoMark variant="flame" ground={tone} height={48} alt="" />
                        </div>
                      )}
                    </div>

                    <p className="flex items-center justify-between gap-2 bg-red text-paper px-3 py-2 type-label">
                      <span>{post.category}</span>
                      {post.published_at && (
                        <span className="type-caption normal-case tracking-normal">
                          {formatDate(post.published_at)}
                        </span>
                      )}
                    </p>

                    <div className="flex flex-col flex-1 min-w-0 px-3 py-3.5 gap-2">
                      <h2 className="type-title line-clamp-3 group-hover:text-red [overflow-wrap:anywhere]">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="type-body-sm line-clamp-2 flex-1">{post.excerpt}</p>
                      )}
                      <span className="type-small underline underline-offset-2">Read the post</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No news yet."
              body="The first posts are on the way. Get label news in your inbox."
              action={{ href: "#subscribe", label: "Get label news" }}
            />
          )}

          {totalPages > 1 && (
            <nav aria-label="News pages" className="mt-12 flex flex-wrap items-center justify-center gap-3">
              {page > 1 && (
                <LinkButton
                  variant="outline"
                  href={page - 1 === 1 ? "/news" : `/news?page=${page - 1}`}
                >
                  Previous page
                </LinkButton>
              )}
              <span className="type-small text-muted">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <LinkButton variant="outline" href={`/news?page=${page + 1}`}>
                  Next page
                </LinkButton>
              )}
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
