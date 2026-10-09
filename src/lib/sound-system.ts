// Shared helpers for the Sound System look (design-system/building.md).
// No JSX here, so both Server and Client Components can import it.

/** The ground (background colour) an element sits on. */
export type Ground = "black" | "yellow" | "red" | "paper";

/**
 * The five-word rule. Poster and headline type hold five words or fewer, and
 * no single word longer than 12 letters. When this returns true, drop to the
 * title style.
 */
export function tooLong(text: string): boolean {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length > 5 || words.some((w) => w.length > 12);
}

/** Solid 3px focus outline in the colour for the ground (utilities in globals.css). */
export const FOCUS: Record<Ground, string> = {
  black: "focus-on-black",
  yellow: "focus-on-yellow",
  red: "focus-on-red",
  paper: "focus-on-paper",
};

export type ButtonVariant = "primary" | "outline" | "lounge" | "dark";

const BUTTON_BASE =
  "inline-flex min-h-[46px] items-center justify-center px-5 type-button text-center transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  // Main action, one per screen. Black text on yellow (11.6:1); hover paper.
  primary: "bg-yellow text-black hover:bg-paper",
  // Second action. Black fill, yellow text, hard 2px yellow edge inside.
  outline:
    "bg-black text-yellow shadow-[inset_0_0_0_2px_var(--color-yellow)] hover:bg-yellow hover:text-black",
  // Lounge actions only. Paper on red (5.0:1).
  lounge: "bg-red text-paper hover:bg-black",
  // Solid black with yellow text: the button for a form on paper.
  dark: "bg-black text-yellow hover:bg-red hover:text-paper",
};

/** Class string for a Sound System button or link button. */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  ground: Ground = "black",
  extra = ""
): string {
  return `${BUTTON_BASE} ${BUTTON_VARIANT[variant]} ${FOCUS[ground]} ${extra}`.trim();
}

/** Text field on paper: 46px, 2px black edge, red focus ring. */
export const FIELD_CLASS =
  "w-full min-h-[46px] px-3 border-2 border-black bg-paper text-black type-body-sm placeholder:text-black/60 focus:outline-3 focus:outline-offset-2 focus:outline-red";

/** Field label on paper. */
export const FIELD_LABEL_CLASS = "block mb-1.5 font-text font-semibold text-sm text-black";

/** Roster tile colours, cycled in this order. */
export const TILE_COLOURS = [
  "bg-yellow text-black",
  "bg-red text-paper",
  "bg-paper text-black",
  "bg-raised text-paper",
] as const;
