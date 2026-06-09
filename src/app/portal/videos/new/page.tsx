import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { VideoRequestForm } from "@/components/VideoRequestForm";

export default async function NewVideoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/portal/videos/new");

  const { data: profile } = await supabase
    .from("profiles")
    .select("artist_id")
    .eq("id", user.id)
    .single();

  if (!profile?.artist_id) redirect("/portal");

  // Only audio assets are suitable for video generation
  const { data: assets } = await supabase
    .from("assets")
    .select("id, title, kind, duration_seconds")
    .eq("artist_id", profile.artist_id)
    .in("kind", ["instrumental", "demo"])
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link
          href="/portal/videos"
          className="text-xs text-bone/40 hover:text-bone/70 transition-colors mb-4 inline-block"
        >
          ← Back to videos
        </Link>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest mb-2">
          Artist Portal
        </p>
        <h1 className="font-display font-bold text-bone text-3xl">
          Request a video
        </h1>
        <div className="mt-3 h-px w-16 bg-bone/20" />
        <p className="mt-4 text-sm text-bone/50 leading-relaxed">
          Choose an instrumental or demo, pick a visual style, and we&apos;ll
          generate a music video automatically. Generation usually takes
          10–20 minutes.
        </p>
      </div>

      <VideoRequestForm assets={assets ?? []} />
    </div>
  );
}
