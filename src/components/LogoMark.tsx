import Image from "next/image";

type Variant = "flame" | "horizontal" | "stacked";
/** What the logo sits on. "photo" puts the light logo in the dark 50% lens. */
type LogoGround = "black" | "red" | "yellow" | "paper" | "photo";

// Frame sizes of the trimmed files in public/brand/.
const RATIO: Record<Variant, number> = {
  flame: 379 / 648,
  horizontal: 2385 / 1072,
  stacked: 722 / 949,
};

type Props = {
  variant?: Variant;
  ground?: LogoGround;
  /** Height in px (width follows the file's proportions). Never below 32 (logo-min).
   *  Pass className such as "h-10 w-auto sm:h-12" to make it responsive. */
  height?: number;
  /** Empty string when the logo is decorative (e.g. inside a link that has its own label). */
  alt?: string;
  className?: string;
  priority?: boolean;
};

/**
 * The One Flame logo, picking the right file for its ground: original on
 * yellow or paper, light on black or red, light inside the dark lens on a
 * photo. Never the original on black or red; never a solid circle.
 */
export default function LogoMark({
  variant = "flame",
  ground = "black",
  height = 40,
  alt = "One Flame Records",
  className = "",
  priority = false,
}: Props) {
  const h = Math.max(32, height);
  const w = Math.round(h * RATIO[variant]);
  const file = ground === "yellow" || ground === "paper" ? "original" : "light";
  const img = (
    <Image
      src={`/brand/${variant}-${file}.svg`}
      alt={alt}
      width={w}
      height={h}
      priority={priority}
      className={ground === "photo" ? "block" : `block ${className}`.trim()}
    />
  );

  if (ground !== "photo") return img;

  // Lens: black at 50%, round, with clear space of half the flame's width.
  const lens = Math.round(Math.max(w, h) + w);
  return (
    <span
      className={`inline-grid place-items-center rounded-full bg-black/50 ${className}`.trim()}
      style={{ width: lens, height: lens }}
    >
      {img}
    </span>
  );
}
