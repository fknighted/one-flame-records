import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { marked } from "marked";
import { createServiceClient } from "@/lib/supabase/server";
import PosterHeadline from "@/components/PosterHeadline";
import PrintedPhoto from "@/components/PrintedPhoto";

type Props = { params: Promise<{ slug: string }> };

// Public post page — cookieless service-client reads, served as ISR. The
// service client bypasses RLS, so every news_posts query below reproduces the
// RLS SELECT policy exactly: is_published = true AND published_at <= now.
export const revalidate = 120;

// Prerender every currently-published post at build; posts published later fall
// back to on-demand ISR (dynamicParams defaults to true).
export async function generateStaticParams() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("news_posts")
    .select("slug")
    .eq("is_published", true)
    .lte("published_at", new Date().toISOString());
  return (data ?? []).map(({ slug }) => ({ slug }));
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServiceClient();
  const { data: post } = await supabase
    .from("news_posts")
    .select("title, excerpt, cover_url")
    .eq("slug", slug)
    .eq("is_published", true)
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

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
  const supabase = createServiceClient();

  const now = new Date().toISOString();

  const { data: post } = await supabase
    .from("news_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .lte("published_at", now)
    .maybeSingle();

  if (!post) notFound();

  const [{ data: prevPost }, { data: nextPost }] = await Promise.all([
    // Previous = published just before this post (chronologically earlier)
    supabase
      .from("news_posts")
      .select("slug, title")
      .eq("is_published", true)
      .lte("published_at", now)
      .lt("published_at", post.published_at ?? now)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    // Next = published just after this post (chronologically later, but not
    // scheduled in the future — must also be <= now)
    supabase
      .from("news_posts")
      .select("slug, title")
      .eq("is_published", true)
      .lte("published_at", now)
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
      {/* ── Header ── */}
      <section className="bg-black">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-10 sm:pt-14 pb-10">
          <Link
            href="/news"
            className="type-label text-yellow underline underline-offset-4 focus-on-black"
          >
            All news
          </Link>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-8 mb-4">
            <span className="bg-red text-paper px-3 py-1.5 type-label">{post.category}</span>
            {post.published_at && (
              <span className="type-small text-muted">{formatDate(post.published_at)}</span>
            )}
          </div>

          <PosterHeadline as="h1" size="headline" className="text-paper">
            {post.title}
          </PosterHeadline>
          <span aria-hidden="true" className="section-bar mt-2" />

          {post.excerpt && (
            <p className="mt-6 type-lead text-paper max-w-[66ch] [overflow-wrap:anywhere]">
              {post.excerpt}
            </p>
          )}
        </div>
      </section>

      {/* ── Cover image ── */}
      {post.cover_url && (
        <div className="relative w-full aspect-[16/9] sm:aspect-[16/6] bg-black">
          <PrintedPhoto
            tone="yellow"
            src={post.cover_url}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      )}

      {/* ── Body: long reading sits on paper ── */}
      <section className="bg-paper text-black">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-[88px]">
          <div
            className="type-body max-w-[66ch] [overflow-wrap:anywhere] [&_p]:mb-4 [&_h2]:font-poster [&_h2]:font-black [&_h2]:uppercase [&_h2]:leading-[0.95] [&_h2]:text-[32px] [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:font-poster [&_h3]:font-extrabold [&_h3]:uppercase [&_h3]:leading-none [&_h3]:text-2xl [&_h3]:mt-8 [&_h3]:mb-2 [&_a]:text-red [&_a]:underline [&_a]:underline-offset-2 [&_a]:focus-visible:outline-3 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-red [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-red [&_blockquote]:pl-4 [&_blockquote]:my-6 [&_blockquote]:font-semibold [&_code]:bg-black/10 [&_code]:px-1 [&_code]:text-sm [&_pre]:bg-black [&_pre]:text-paper [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:mb-4 [&_pre_code]:bg-transparent [&_hr]:border-black [&_hr]:border-t-[3px] [&_hr]:my-8 [&_img]:max-w-full [&_img]:h-auto"
            dangerouslySetInnerHTML={{ __html: htmlBody }}
          />

          <div className="mt-12 pt-8 border-t-[3px] border-black grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
            <div className="min-w-0 text-left">
              {prevPost && (
                <Link href={`/news/${prevPost.slug}`} className="block underline underline-offset-2 hover:text-red focus-on-paper">
                  <span className="block type-label mb-1">Previous post</span>
                  <span className="block type-small line-clamp-2 [overflow-wrap:anywhere]">{prevPost.title}</span>
                </Link>
              )}
            </div>
            <div className="sm:text-center">
              <Link href="/news" className="type-label underline underline-offset-4 hover:text-red focus-on-paper">
                All news
              </Link>
            </div>
            <div className="min-w-0 sm:text-right">
              {nextPost && (
                <Link href={`/news/${nextPost.slug}`} className="block underline underline-offset-2 hover:text-red focus-on-paper">
                  <span className="block type-label mb-1">Next post</span>
                  <span className="block type-small line-clamp-2 [overflow-wrap:anywhere]">{nextPost.title}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
