import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { marked } from "marked";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ slug: string }> };

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("news_posts")
    .select("title, excerpt, cover_url")
    .eq("slug", slug)
    .single();

  if (!post) return { title: "Not found — One Flame Records" };

  return {
    title: `${post.title} — One Flame Records`,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_url ? [{ url: post.cover_url, alt: post.title }] : [],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function NewsPostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("news_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`)
    .single();

  if (!post) notFound();

  const now = new Date().toISOString();
  const publishedFilter = `published_at.is.null,published_at.lte.${now}`;

  const [{ data: prevPost }, { data: nextPost }] = await Promise.all([
    // Previous = published just before this post (chronologically earlier)
    supabase
      .from("news_posts")
      .select("slug, title")
      .eq("is_published", true)
      .or(publishedFilter)
      .lt("published_at", post.published_at ?? now)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    // Next = published just after this post (chronologically later)
    supabase
      .from("news_posts")
      .select("slug, title")
      .eq("is_published", true)
      .or(publishedFilter)
      .gt("published_at", post.published_at ?? now)
      .order("published_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const htmlBody = await marked(post.body ?? "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_url ?? undefined,
    datePublished: post.published_at ?? undefined,
    publisher: {
      "@type": "Organization",
      name: "One Flame Records",
      url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://oneflamerecords.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }}
      />
      {/* ── Ink header ── */}
      <section className="bg-ink">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-12 pb-10">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-xs text-bone/30 hover:text-bone/60 transition-colors mb-6"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M19 12H5M5 12l7-7M5 12l7 7" />
            </svg>
            All news
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span
              className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider capitalize ${CATEGORY_PILL[post.category] ?? "bg-bone/10 text-bone"}`}
            >
              {post.category}
            </span>
            {post.published_at && (
              <span className="text-xs text-bone/40">{formatDate(post.published_at)}</span>
            )}
          </div>

          <h1 className="font-display font-bold text-bone text-[clamp(1.75rem,4vw,2.75rem)] leading-tight tracking-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-3 text-bone/60 text-base leading-relaxed max-w-prose">
              {post.excerpt}
            </p>
          )}
        </div>
      </section>

      {/* ── Cover image ── */}
      {post.cover_url && (
        <div className="relative w-full aspect-[16/6] bg-ink overflow-hidden">
          <Image
            src={post.cover_url}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      )}

      {/* ── Body ── */}
      <section className="bg-cream">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
          <div
            className="prose prose-ink max-w-none text-ink/80 leading-relaxed [&_h2]:font-display [&_h2]:text-oxblood [&_h2]:text-2xl [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:font-display [&_h3]:text-ink [&_h3]:text-xl [&_h3]:mt-6 [&_h3]:mb-2 [&_a]:text-oxblood [&_a]:underline hover:[&_a]:text-ochre [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-oxblood/30 [&_blockquote]:pl-4 [&_blockquote]:text-ink/60 [&_blockquote]:italic [&_code]:bg-ink/5 [&_code]:px-1 [&_code]:rounded [&_code]:text-sm [&_pre]:bg-ink/5 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_hr]:border-oxblood/20 [&_hr]:my-8"
            dangerouslySetInnerHTML={{ __html: htmlBody }}
          />

          <div className="mt-12 pt-8 border-t border-oxblood/10 grid grid-cols-3 gap-4 items-center text-sm">
            <div className="text-left">
              {prevPost && (
                <Link href={`/news/${prevPost.slug}`} className="text-oxblood hover:text-ochre transition-colors">
                  <span className="block text-xs text-ink/40 mb-1">← Previous</span>
                  <span className="font-medium line-clamp-1">{prevPost.title}</span>
                </Link>
              )}
            </div>
            <div className="text-center">
              <Link href="/news" className="text-xs text-ink/40 hover:text-oxblood transition-colors">
                All news
              </Link>
            </div>
            <div className="text-right">
              {nextPost && (
                <Link href={`/news/${nextPost.slug}`} className="text-oxblood hover:text-ochre transition-colors">
                  <span className="block text-xs text-ink/40 mb-1">Next →</span>
                  <span className="font-medium line-clamp-1">{nextPost.title}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
