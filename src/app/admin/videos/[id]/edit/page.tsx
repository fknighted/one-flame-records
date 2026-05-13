import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import VideoForm from "@/components/VideoForm";
import { updateVideo } from "@/app/admin/videos/actions";

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const [{ data: video, error }, { data: artists }, { data: releases }] =
    await Promise.all([
      supabase.from("videos").select("*").eq("id", id).single(),
      supabase.from("artists").select("id, stage_name").order("stage_name"),
      supabase.from("releases").select("id, title").order("title"),
    ]);

  if (error || !video) notFound();

  const initialValues = {
    id: video.id,
    title: video.title,
    youtube_id: video.youtube_id,
    artist_id: video.artist_id,
    release_id: video.release_id,
    kind: video.kind,
    featured: video.featured,
    published_at: video.published_at,
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-bone">{video.title}</h1>
      <VideoForm
        action={updateVideo}
        initialValues={initialValues}
        mode="edit"
        artists={artists ?? []}
        releases={releases ?? []}
      />
    </div>
  );
}
