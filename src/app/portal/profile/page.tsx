import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PortalProfileForm from "@/components/PortalProfileForm";
import type { Tables } from "@/types/supabase";

type ArtistRow = Tables<"artists">;

export default async function PortalProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/portal/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("artist_id")
    .eq("id", user.id)
    .single();

  if (!profile?.artist_id) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-2xl text-bone mb-4">Profile</h1>
        <p className="text-bone/50 text-sm">
          Your artist profile hasn&apos;t been linked yet. Contact the label.
        </p>
      </div>
    );
  }

  const { data: artist, error } = await supabase
    .from("artists")
    .select("*")
    .eq("id", profile.artist_id)
    .single<ArtistRow>();

  if (error || !artist) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-2xl text-bone mb-4">Profile</h1>
        <p className="text-red-400 text-sm">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sage mb-2">
          Artist Portal
        </p>
        <h1 className="font-display font-bold text-bone text-3xl">Profile</h1>
        <div className="mt-3 h-px w-16 bg-bone/20" />
      </div>

      <PortalProfileForm
        initialValues={{
          bio: artist.bio,
          photo_url: artist.photo_url,
          socials: (artist.socials as Record<string, string>) ?? {},
          streaming: (artist.streaming as Record<string, string>) ?? {},
          stage_name: artist.stage_name,
          hometown: artist.hometown,
          genres: artist.genres,
        }}
      />
    </div>
  );
}
