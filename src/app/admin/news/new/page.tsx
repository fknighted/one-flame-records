import NewsForm from "@/components/NewsForm";
import { createNewsPost } from "./actions";

export default function NewNewsPostPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-bone">New Post</h1>
      <NewsForm action={createNewsPost} mode="create" />
    </div>
  );
}
