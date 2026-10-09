import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import ShareToggle from "./ShareToggle";

export default async function SavedVideoPage({ params }: { params: Promise<{ job_id: string }> }) {
  const { job_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/portal/videos");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const client = profile?.role === "admin" ? createServiceClient() : supabase;
  const { data: video } = await client.from("video_jobs").select("id, output_url, is_public, assets(title)")
    .eq("id", job_id).eq("status", "complete").single();
  if (!video) notFound();
  const asset = Array.isArray(video.assets) ? video.assets[0] : video.assets;
  const title = asset?.title ?? "Saved video";
  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-4xl space-y-6">
      <Link href="/portal/videos" className="text-sm text-bone/60 hover:text-ochre">← Saved videos</Link>
      <h1 className="font-display text-3xl text-bone">{title}</h1>
      {video.output_url ? (
        <div className="space-y-4">
          <video src={video.output_url} controls preload="metadata" aria-label={title} className="w-full rounded-lg bg-black" />
          <a href={video.output_url} download={`${title}.mp4`} className="inline-block text-sm text-ochre hover:text-bone">Download video</a>
        </div>
      ) : <p className="text-bone/60">No video file is available for this saved record.</p>}
      <ShareToggle jobId={video.id} isPublic={video.is_public ?? false} />
    </div>
  );
}
