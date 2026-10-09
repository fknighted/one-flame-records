import { tooLong } from "@/lib/sound-system";

type Variant = "dark" | "light" | "paper";

type Props = {
  title: string;
  /** Deprecated: the Sound System has no eyebrow above a headline. Accepted so
   *  existing pages compile, but not rendered. */
  eyebrow?: string;
  action?: React.ReactNode;
  /** Deprecated alias for variant="dark". */
  dark?: boolean;
  /** dark: on black (paper title). light: on yellow (black title).
   *  paper: on paper (black title). The bar is red on all three. */
  variant?: Variant;
  as?: "h1" | "h2";
};

const TITLE_COLOUR: Record<Variant, string> = {
  dark: "text-paper",
  light: "text-black",
  paper: "text-black",
};

/**
 * Section opener: a headline with a short, thick red bar under it. Titles over
 * five words (or with a word over 12 letters) drop to title size.
 */
export default function SectionHeader({ title, action, variant, as = "h2" }: Props) {
  const v: Variant = variant ?? "dark";
  const Tag = as;
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 mb-8">
      <div className="min-w-0">
        <Tag
          className={`${tooLong(title) ? "type-title" : "type-headline"} ${TITLE_COLOUR[v]} [overflow-wrap:anywhere]`}
        >
          {title}
        </Tag>
        <span aria-hidden="true" className="section-bar mt-2" />
      </div>
      {action && <div className="shrink-0 [&_a]:inline-flex [&_a]:min-h-[44px] [&_a]:items-center">{action}</div>}
    </div>
  );
}
