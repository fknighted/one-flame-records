import { createClient } from "@/lib/supabase/server";
import ArtistCard from "@/components/ArtistCard";

export const metadata = {
  title: "Artists",
  description: "The full One Flame Records roster — reggae and dancehall artists from Montego Bay, Jamaica.",
};

export default async function ArtistsPage() {
  const supabase = await createClient();

  const { data: artists } = await supabase
    .from("artists")
    .select("id, slug, stage_name, photo_url, hometown")
    .eq("status", "active")
    .order("stage_name", { ascending: true });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <div className="mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ochre mb-2">
          The Roster
        </p>
        <h1 className="font-display font-bold text-oxblood text-[2.5rem] leading-[1.05] tracking-tight">
          Artists
        </h1>
        <div className="mt-3 h-px w-16 bg-oxblood" />
      </div>

      {artists && artists.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8">
          {artists.map((artist) => (
            <ArtistCard
              key={artist.id}
              slug={artist.slug}
              stage_name={artist.stage_name}
              photo_url={artist.photo_url}
              hometown={artist.hometown}
            />
          ))}
        </div>
      ) : (
        <p className="text-ink/50">Artists coming soon.</p>
      )}
    </div>
  );
}
