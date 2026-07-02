import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import DeleteNewsPostButton from "./DeleteNewsPostButton";

export default async function AdminNewsPage() {
  const supabase = createServiceClient();
  const { data: posts } = await supabase
    .from("news_posts")
    .select("id, title, slug, category, is_published, published_at, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-bone">News</h1>
        <Link
          href="/admin/news/new"
          className="rounded bg-oxblood px-4 py-2 text-sm font-medium text-bone hover:bg-oxblood/80 transition-colors"
        >
          + New Post
        </Link>
      </div>

      {posts && posts.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-bone/10">
          <table className="w-full text-sm text-bone/80">
            <thead className="border-b border-bone/10 text-[11px] uppercase tracking-wider text-bone/60">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Published</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-bone/5">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-bone/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-bone">{post.title}</td>
                  <td className="px-4 py-3 capitalize text-bone/60">{post.category}</td>
                  <td className="px-4 py-3">
                    {post.is_published ? (
                      <span className="inline-block rounded-full bg-forest/30 px-2 py-0.5 text-xs text-sage">
                        Published
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-bone/10 px-2 py-0.5 text-xs text-bone/60">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-bone/50 text-xs">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link
                      href={`/admin/news/${post.id}/edit`}
                      className="text-xs text-rose hover:text-ochre transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteNewsPostButton id={post.id} title={post.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-bone/60 text-sm py-10 text-center">No posts yet.</p>
      )}
    </div>
  );
}
