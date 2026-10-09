import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import NewsForm from "@/components/NewsForm";
import DeletePostButton from "./DeletePostButton";
import { updateNewsPost } from "./actions";
import { deleteNewsPost } from "../../actions";

type Props = { params: Promise<{ id: string }> };

export default async function EditNewsPostPage({ params }: Props) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: post } = await supabase
    .from("news_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const deleteAction = deleteNewsPost.bind(null, post.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="studio-page-title">Edit Post</h1>
        <DeletePostButton action={deleteAction} />
      </div>
      <NewsForm action={updateNewsPost} mode="edit" post={post} />
    </div>
  );
}
