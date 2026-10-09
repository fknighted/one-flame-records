type Props = {
  /** vertical: a 60px band down one edge (beside a photo or along a headline
   *  block). horizontal: a 42px strip across the top or bottom, for phones. */
  orientation?: "vertical" | "horizontal";
  holes?: "yellow" | "red";
  /** Positioning and size overrides, e.g. "absolute right-0 inset-y-0 w-[92px]". */
  className?: string;
};

/**
 * The speaker grille, the brand's one pattern. Only beside a photo or along a
 * block edge: never over a photo, never as a full background, never behind
 * text. Decorative, so hidden from screen readers.
 */
export default function GrilleBand({ orientation = "vertical", holes = "yellow", className }: Props) {
  const pattern = holes === "red" ? "grille-red" : "grille";
  const shape =
    className ??
    (orientation === "vertical" ? "absolute right-0 inset-y-0 w-[60px]" : "block w-full h-[42px]");
  return <span aria-hidden="true" className={`${pattern} ${shape}`} />;
}
