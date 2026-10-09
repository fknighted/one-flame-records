import Link from "next/link";
import { TILE_COLOURS } from "@/lib/sound-system";

type Props = {
  slug: string;
  stage_name: string;
  /** Position in the grid; cycles yellow, red, paper, raised. */
  index?: number;
  /** The caption under the name. */
  caption?: string;
};

/**
 * The artist tile before there is a photo: the initial at poster size on a
 * colour block, the stage name in title type, one caption line. Square.
 * Sizes follow the tile width (container query), so it fits two-up at 375px.
 */
export default function ArtistInitialTile({ slug, stage_name, index = 0, caption = "Signed to One Flame" }: Props) {
  const initial = Array.from(stage_name.trim())[0] ?? "";
  return (
    <Link
      href={`/artists/${slug}`}
      className={`${TILE_COLOURS[index % 4]} @container aspect-square flex flex-col justify-between p-3 overflow-hidden font-poster font-black uppercase leading-[0.88] focus-on-black`}
    >
      <span aria-hidden="true" className="text-[clamp(54px,45cqi,96px)] leading-[0.75]">
        {initial}
      </span>
      <span className="min-w-0">
        <span className="block text-[clamp(18px,13cqi,28px)] [overflow-wrap:anywhere]">{stage_name}</span>
        <small className="block mt-1 font-text font-semibold normal-case text-xs tracking-normal leading-[1.4]">
          {caption}
        </small>
      </span>
    </Link>
  );
}
