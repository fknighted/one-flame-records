import LogoMark from "@/components/LogoMark";

type Props = {
  /** yellow: dark rings + original flame. red: paper rings + light flame.
   *  photo: dark rings + light flame in the 50% lens. */
  ground?: "yellow" | "red" | "photo";
  /** Ring diameter in px. 190 on a hero (rings-hero), 118 to 132 on posts and the home photo. */
  size?: number;
  className?: string;
};

/**
 * Three thin rings around the flame, like a speaker cone: at 44%, 66% and 88%
 * of the radius, at full, 55% and 28% strength. For hero moments only; never
 * on studio screens. Decorative, so hidden from screen readers.
 */
export default function SpeakerRings({ ground = "yellow", size = 120, className = "" }: Props) {
  const stroke = ground === "red" ? "var(--color-paper)" : "var(--color-black)";
  // 2.5px rings at 190px, scaled by viewBox.
  const strokeWidth = 1.3;
  const flame = Math.max(32, Math.round(size * 0.4));
  return (
    <span
      aria-hidden="true"
      className={`relative inline-grid place-items-center shrink-0 ${className}`.trim()}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <circle cx="50" cy="50" r="22" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
        <circle cx="50" cy="50" r="33" fill="none" stroke={stroke} strokeOpacity="0.55" strokeWidth={strokeWidth} />
        <circle cx="50" cy="50" r="44" fill="none" stroke={stroke} strokeOpacity="0.28" strokeWidth={strokeWidth} />
      </svg>
      <span className="relative">
        <LogoMark variant="flame" ground={ground} height={ground === "photo" ? Math.round(flame * 0.6) : flame} alt="" />
      </span>
    </span>
  );
}
