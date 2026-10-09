import { tooLong } from "@/lib/sound-system";

type Props = {
  /** Plain text, written in sentence case; the type style uppercases it. */
  children: string;
  /** poster: home and Lounge heroes only. headline: page and section openers. */
  size?: "poster" | "headline";
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
};

/**
 * A poster or headline that enforces the five-word rule: more than five words,
 * or any word longer than 12 letters, drops to the title style so it never
 * runs off a phone screen. Colour comes from the parent or className.
 */
export default function PosterHeadline({ children, size = "headline", as = "h2", className = "" }: Props) {
  const Tag = as;
  const style = tooLong(children) ? "type-title" : size === "poster" ? "type-poster" : "type-headline";
  return <Tag className={`${style} [overflow-wrap:anywhere] ${className}`.trim()}>{children}</Tag>;
}
