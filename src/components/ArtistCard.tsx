import Link from "next/link";
import PrintedPhoto from "@/components/PrintedPhoto";
import CornerBlock from "@/components/CornerBlock";
import ArtistInitialTile from "@/components/ArtistInitialTile";
import { TILE_COLOURS } from "@/lib/sound-system";

type Props = {
  slug: string;
  stage_name: string;
  photo_url: string | null;
  hometown: string | null;
  /** Position in the grid. Cycles the tile colours (yellow, red, paper,
   *  raised) and the photo print (yellow, red). Optional; defaults to 0. */
  index?: number;
};

/**
 * Roster tile. With a photo: the photo printed in the tile's block colour, the
 * corner block top right, the name in a black box along the bottom edge.
 * Without one: the initial on a colour block (ArtistInitialTile).
 */
export default function ArtistCard({ slug, stage_name, photo_url, hometown, index = 0 }: Props) {
  if (!photo_url) {
    return (
      <ArtistInitialTile
        slug={slug}
        stage_name={stage_name}
        index={index}
        caption={hometown ?? undefined}
      />
    );
  }

  // Photos print only in yellow or red, never paper, black or green.
  const tone = index % 2 === 0 ? "yellow" : "red";
  const block = TILE_COLOURS[index % 2];

  return (
    <Link
      href={`/artists/${slug}`}
      className={`${block} @container relative block aspect-square overflow-hidden focus-on-black`}
    >
      <PrintedPhoto
        tone={tone}
        src={photo_url}
        alt={stage_name}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
      <CornerBlock tone="black" size={56} className="@[220px]:w-[72px]! @[220px]:h-[72px]!" />

      {/* Name box on the bottom edge, never on the photo itself */}
      <span className="absolute left-0 bottom-0 max-w-full bg-black text-paper px-3 py-2">
        <span className="block font-poster font-extrabold uppercase leading-[0.95] text-[clamp(18px,12cqi,28px)] [overflow-wrap:anywhere]">
          {stage_name}
        </span>
        {hometown && <span className="block mt-0.5 type-caption text-muted">{hometown}</span>}
      </span>
    </Link>
  );
}
