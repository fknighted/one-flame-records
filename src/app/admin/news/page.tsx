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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="studio-page-title">News</h1>
        <Link
          href="/admin/news/new"
          className="studio-btn studio-btn-primary"
        >
          + New Post
        </Link>
      </div>

      {posts && posts.length > 0 ? (
        <div className="studio-table-wrap">
          <table className="studio-table min-w-[560px]">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Published</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="font-semibold [overflow-wrap:anywhere]">{post.title}</td>
                  <td className="capitalize text-muted">{post.category}</td>
                  <td>
                    {post.is_published ? (
                      <span className="studio-chip studio-chip-ok">Published</span>
                    ) : (
                      <span className="studio-chip studio-chip-neutral">Draft</span>
                    )}
                  </td>
                  <td className="studio-figures text-muted whitespace-nowrap">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="is-num">
                    <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/news/${post.id}/edit`}
                      className="studio-btn studio-btn-secondary studio-btn-sm"
                    >
                      Edit
                    </Link>
                    <DeleteNewsPostButton id={post.id} title={post.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted py-10 text-center">No posts yet.</p>
      )}
    </div>
  );
}
