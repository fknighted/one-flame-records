import { createServiceClient } from "@/lib/supabase/server";
import ArtistCard from "@/components/ArtistCard";
import SectionHeader from "@/components/SectionHeader";
import EmptyState from "@/components/EmptyState";

export const metadata = {
  title: "Artists",
  description:
    "The full One Flame Records roster — reggae and dancehall artists from Montego Bay, Jamaica.",
};

// Public roster — cookieless service-client read filtered to status='active'
// (matching the artists RLS SELECT policy), served as ISR.
export const revalidate = 120;

export default async function ArtistsPage() {
  const supabase = createServiceClient();

  const { data: artists } = await supabase
    .from("artists")
    .select("id, slug, stage_name, photo_url, hometown")
    .eq("status", "active")
    .order("stage_name", { ascending: true });

  const count = artists?.length ?? 0;

  return (
    <section className="bg-black">
      <div className={`mx-auto max-w-6xl px-4 sm:px-6 py-14 ${count > 0 ? "sm:py-[88px]" : ""}`}>
        <SectionHeader
          as="h1"
          title="The roster"
          action={
            count > 0 ? (
              <p className="type-label text-muted">
                {count} artist{count !== 1 ? "s" : ""}
              </p>
            ) : undefined
          }
        />
        {artists && artists.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 [&>*:last-child:nth-child(odd)]:col-span-2 [&>*:last-child:nth-child(odd)]:aspect-[2/1] md:[&>*:last-child:nth-child(odd)]:col-span-1 md:[&>*:last-child:nth-child(odd)]:aspect-square">
            {artists.map((artist, i) => (
              <ArtistCard
                key={artist.id}
                index={i}
                slug={artist.slug}
                stage_name={artist.stage_name}
                photo_url={artist.photo_url}
                hometown={artist.hometown}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No artists yet."
            body="We sign artists, not sounds. If the music is rooted, honest and built to last, we want to hear it."
            action={{ href: "/sign", label: "Sign with us" }}
          />
        )}
      </div>
    </section>
  );
}
