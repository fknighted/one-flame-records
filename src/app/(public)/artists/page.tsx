import { createClient } from "@/lib/supabase/server";
import ArtistCard from "@/components/ArtistCard";

export const metadata = {
  title: "Artists",
  description:
    "The full One Flame Records roster — reggae and dancehall artists from Montego Bay, Jamaica.",
};

export default async function ArtistsPage() {
  const supabase = await createClient();

  const { data: artists } = await supabase
    .from("artists")
    .select("id, slug, stage_name, photo_url, hometown")
    .eq("status", "active")
    .order("stage_name", { ascending: true });

  const count = artists?.length ?? 0;

  return (
    <>
      {/* ── Ink banner ── */}
      <section className="bg-ink">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-forest mb-4">
            The Roster
          </p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-display font-bold text-bone text-[clamp(2.5rem,5vw,4rem)] leading-[1.02] tracking-tight">
              Artists
            </h1>
            {count > 0 && (
              <p className="text-bone/30 text-sm font-medium mb-1">
                {count} artist{count !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="mt-4 h-px w-20 bg-oxblood" />
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          {artists && artists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 sm:gap-1.5">
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
            <p className="text-ink/50 py-12 text-center text-sm">Artists coming soon.</p>
          )}
        </div>
      </section>
    </>
  );
}
