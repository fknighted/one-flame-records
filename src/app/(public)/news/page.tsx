import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

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

const CATEGORY_PILL: Record<string, string> = {
  label:   "bg-oxblood/10 text-oxblood",
  release: "bg-forest/10 text-forest",
  event:   "bg-ochre/10 text-ochre",
};

const PAGE_SIZE = 9;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to   = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const now = new Date().toISOString();
  const { data: posts, count } = await supabase
    .from("news_posts")
    .select("id, slug, title, excerpt, cover_url, category, published_at", { count: "exact" })
    .eq("is_published", true)
    .or(`published_at.is.null,published_at.lte.${now}`)
    .order("published_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <>
      {/* ── Ink banner ── */}
      <section className="bg-ink">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-forest mb-4">
            From the Label
          </p>
          <h1 className="font-display font-bold text-bone text-[clamp(2.5rem,5vw,4rem)] leading-[1.02] tracking-tight">
            News
          </h1>
          <div className="mt-4 h-px w-20 bg-oxblood" />
        </div>
      </section>

      {/* ── Posts grid ── */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          {posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/news/${post.slug}`}
                  className="group flex flex-col rounded-lg overflow-hidden border border-oxblood/10 hover:border-oxblood/30 transition-colors bg-white/50"
                >
                  {/* Cover */}
                  <div className="relative aspect-video bg-ink/5 overflow-hidden">
                    {post.cover_url ? (
                      <Image
                        src={post.cover_url}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <svg viewBox="0 0 20 28" className="w-10 h-auto" aria-hidden="true">
                          <path d="M10 1C10 1 4 9 4 16C4 19.8 6.3 23.1 10 25C13.7 23.1 16 19.8 16 16C16 9 10 1 10 1Z" fill="#8B2A1F" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex flex-col flex-1 p-4 gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider capitalize ${CATEGORY_PILL[post.category] ?? "bg-ink/10 text-ink"}`}
                      >
                        {post.category}
                      </span>
                      {post.published_at && (
                        <span className="text-[11px] text-ink/40">
                          {formatDate(post.published_at)}
                        </span>
                      )}
                    </div>

                    <h2 className="font-display font-semibold text-ink text-lg leading-snug group-hover:text-oxblood transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="text-ink/60 text-sm leading-relaxed line-clamp-2 flex-1">
                        {post.excerpt}
                      </p>
                    )}

                    <span className="mt-2 text-xs font-medium text-oxblood group-hover:text-ochre transition-colors">
                      Read more →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-20 text-center text-ink/40 text-sm">
              No posts yet — check back soon.
            </p>
          )}

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={page - 1 === 1 ? "/news" : `/news?page=${page - 1}`}
                  className="px-4 py-2 rounded border border-oxblood/20 text-sm text-oxblood hover:bg-oxblood/5 transition-colors"
                >
                  ← Prev
                </Link>
              )}
              <span className="text-sm text-ink/40">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/news?page=${page + 1}`}
                  className="px-4 py-2 rounded border border-oxblood/20 text-sm text-oxblood hover:bg-oxblood/5 transition-colors"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
