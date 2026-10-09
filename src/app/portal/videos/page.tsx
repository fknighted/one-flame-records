import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import TogglePublicButton from "./TogglePublicButton";
import { toggleVideoPublic } from "./actions";
import type { Tables } from "@/types/supabase";

type SavedVideo = Tables<"video_jobs"> & { assets: { title: string; kind: string } | null };
export const metadata = { title: "Saved videos" };

export default async function PortalVideosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/portal/videos");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const client = profile?.role === "admin" ? createServiceClient() : supabase;
  const { data } = await client.from("video_jobs").select("*, assets(title, kind)")
    .eq("status", "complete").order("created_at", { ascending: false }).returns<SavedVideo[]>();
  const videos = data ?? [];
  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-3xl">
      <h1 className="studio-page-title mb-3">Saved videos</h1>
      <p className="text-[15px] text-muted mb-8">Watch and manage your finished videos.</p>
      {videos.length === 0 ? <div className="studio-empty"><p className="studio-empty-title">No saved videos yet.</p></div> : (
        <ul className="space-y-3">
          {videos.map(video => (
            <li key={video.id} className="studio-card">
              <Link href={`/portal/videos/${video.id}`} className="studio-section-title studio-link studio-focus [overflow-wrap:anywhere]">
                {video.assets?.title ?? "Untitled video"}
              </Link>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <TogglePublicButton action={toggleVideoPublic.bind(null, video.id)} isPublic={!!video.is_public} />
                {video.output_url && <a href={video.output_url} target="_blank" rel="noopener noreferrer" className="studio-link studio-focus text-[15px]">Watch video</a>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
