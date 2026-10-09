import LogoMark from "@/components/LogoMark";

type Props = {
  /** black block + light flame (photos, yellow cards); yellow block + original flame (red cards). */
  tone?: "black" | "yellow";
  /** Side in px: 72 (corner-block) on cards, 78 on posts. */
  size?: number;
  className?: string;
};

/**
 * The flyer "price tag": a square of colour flush in the top-right corner of a
 * photo or card, with the flame centred. The parent must be `relative`.
 * Decorative, so hidden from screen readers.
 */
export default function CornerBlock({ tone = "black", size = 72, className = "" }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`absolute right-0 top-0 z-[1] grid place-items-center ${
        tone === "yellow" ? "bg-yellow" : "bg-black"
      } ${className}`.trim()}
      style={{ width: size, height: size }}
    >
      <LogoMark
        variant="flame"
        ground={tone === "yellow" ? "yellow" : "black"}
        height={Math.max(32, Math.round(size * 0.62))}
        alt=""
      />
    </span>
  );
}
