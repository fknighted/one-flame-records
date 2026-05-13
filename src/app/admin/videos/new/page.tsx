import { createServiceClient } from "@/lib/supabase/server";
import VideoForm from "@/components/VideoForm";
import { createVideo } from "@/app/admin/videos/actions";

export default async function NewVideoPage() {
  const supabase = createServiceClient();
  const [{ data: artists }, { data: releases }] = await Promise.all([
    supabase.from("artists").select("id, stage_name").eq("status", "active").order("stage_name"),
    supabase.from("releases").select("id, title").order("title"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-bone">Add Video</h1>
      <VideoForm
        action={createVideo}
        mode="create"
        artists={artists ?? []}
        releases={releases ?? []}
      />
    </div>
  );
}
