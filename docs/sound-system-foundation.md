# Sound System foundation: how to use it on public pages

For the agents rebuilding `src/app/(public)/**/page.tsx`. The full rules are in `design-system/brand-book.md` and `design-system/building.md`; read them first. This file lists what already exists so you do not rebuild it.

## What the layout already does

- `src/app/(public)/layout.tsx` sets `bg-black text-paper font-text`, removes the paper grain and mounts `<PrintFilters />` (the two SVG photo filters). Do not mount them again.
- The header (black, light horizontal logo, 4px yellow line, phone `Menu` button) and the footer (paper newsletter block, black footer, light stacked logo, "Montego Bay, Jamaica") are done. Pages render only what goes between them.
- Old tokens (`cream`, `ink`, `bone`, `oxblood`, `forest`, `ochre`, `rose`, `sage`, `status-*`) and the Fraunces, Inter and JetBrains fonts are still loaded for the studio screens. **Do not use them on public pages.** The `body` rule in `globals.css` still paints cream; every public page sits inside the black layout wrapper, so it does not show.

## Tokens (Tailwind classes)

Colours: `black yellow red paper green muted line panel raised` as `bg-*`, `text-*`, `border-*`, `outline-*`. Lens: `bg-black/50`. Fonts: `font-poster` (Big Shoulders, Display cut set automatically), `font-text` (Archivo).

Type styles, one class each (defined in `globals.css`):

| Class | Use |
| --- | --- |
| `type-poster` | Home and Lounge hero only. Five words or fewer. |
| `type-headline` | Page and section openers. Five words or fewer. |
| `type-title` | Names, card titles, any long headline. |
| `type-title-sm` | Lounge list rows, small titles. |
| `type-number`, `type-money` | Counts and money (money is yellow). |
| `type-lead` | The line under a hero or headline. |
| `type-body`, `type-body-sm` | Reading text. Keep `max-w-[66ch]`. |
| `type-button`, `type-label`, `type-small`, `type-caption` | Buttons, tags, nav and meta lines, tile captions. |

Building blocks: `section-bar` (the 72 x 8 red bar), `grille` / `grille-red` (speaker-grille pattern), `print-yellow` / `print-red` (three-tone photo), and focus rings by ground: `focus-on-black`, `focus-on-yellow`, `focus-on-red`, `focus-on-paper`. Put the matching one on **every** link and button you write. Fields use `focus:` rings and are already handled by `FIELD_CLASS`.

Layout: content `mx-auto max-w-6xl px-4 sm:px-6`; section padding `py-14 sm:py-[88px]`; grid gaps `gap-2`.

## Helpers: `src/lib/sound-system.ts`

- `tooLong(text)`: the five-word rule (more than 5 words, or a word over 12 letters).
- `buttonClasses(variant, ground, extra?)`: button class string, for `<a>` or `<button>` you write yourself.
- `FIELD_CLASS`, `FIELD_LABEL_CLASS`: a field and its label on paper.
- `FOCUS[ground]`, `TILE_COLOURS`, types `Ground` and `ButtonVariant`.

## Components (`src/components/`)

| Component | Props | Notes |
| --- | --- | --- |
| `LinkButton` | all `next/link` props, `variant`, `ground` | `variant`: `primary` (yellow, **one per screen**), `outline` (second action), `lounge` (red, Lounge only), `dark` (black with yellow text, for paper blocks). `ground` sets the focus colour; default `black`. |
| `Button` | all `<button>` props, `variant`, `ground` | Same variants. Defaults to `type="button"`. Works in Server Components (no handlers needed for `type="submit"`). |
| `SectionHeader` | `title`, `action?`, `variant?: "dark" \| "light" \| "paper"`, `as?: "h1" \| "h2"` | Headline plus red bar. `dark` = on black (default), `light` = on yellow, `paper` = on paper. Drops to title size past five words. `eyebrow` and `dark` are still accepted but ignored; remove them as you rebuild each page. |
| `PosterHeadline` | `children: string`, `size?: "poster" \| "headline"`, `as?`, `className?` | Enforces the five-word rule. Text in sentence case; the class uppercases. |
| `PrintedPhoto` | all `next/image` props plus `tone: "yellow" \| "red"` | Prints the photo in three tones for the block it sits on. Original untouched. Never put text on it. |
| `LogoMark` | `variant?: "flame" \| "horizontal" \| "stacked"`, `ground?: "black" \| "red" \| "yellow" \| "paper" \| "photo"`, `height?`, `alt?`, `className?`, `priority?` | Picks original (yellow/paper) or light (black/red); `photo` puts the light logo in the 50% black lens. Minimum 32px tall. |
| `SpeakerRings` | `ground?: "yellow" \| "red" \| "photo"`, `size?` (px, 120 default; 190 on a hero) | Hero moments only. Decorative. |
| `CornerBlock` | `tone?: "black" \| "yellow"`, `size?` (72 default) | Flush top-right of a photo or card; parent must be `relative`. Yellow block only on red cards. |
| `GrilleBand` | `orientation?: "vertical" \| "horizontal"`, `holes?: "yellow" \| "red"`, `className?` | Vertical: `absolute right-0 inset-y-0 w-[60px]` (parent `relative`). Horizontal: a 42px strip. Beside a photo or along a block edge only. |
| `ArtistCard` | unchanged, plus optional `index` | **Pass `index={i}`** from your `.map` so tiles cycle yellow, red, paper, raised and photos alternate yellow and red prints. |
| `ArtistInitialTile` | `slug`, `stage_name`, `index?`, `caption?` | Used by `ArtistCard` when there is no photo. Caption defaults to "Signed to One Flame"; `ArtistCard` passes the hometown when there is one. |
| `ReleaseCard` | unchanged | Small 4:5 paper poster. `dark` is ignored. Cover art is not printed (it is artwork). |
| `VideoEmbed` | unchanged | Title and artist are paper/muted, so place it on black. |
| `ReleasesFilter`, `VideosFilter` | unchanged | Square chips for a black ground. |
| `ContactForm`, `SignupForm`, `SubscribeForm` | unchanged | Contact and Signup draw their own paper block; do not wrap them in another one. Subscribe expects a paper parent (the footer provides it). |
| `EmptyState` | `title`, `body?`, `action?: { href, label }`, `children?` | Replaces every "coming soon". Dashed yellow edge on black. |

## Examples

```tsx
import SectionHeader from "@/components/SectionHeader";
import LinkButton from "@/components/LinkButton";
import ArtistCard from "@/components/ArtistCard";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";

<section className="bg-black">
  <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px]">
    <SectionHeader
      title="The roster"
      action={<Link href="/artists" className="type-label text-yellow underline underline-offset-4 focus-on-black">All artists</Link>}
    />
    {artists.length > 0 ? (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {artists.map((a, i) => (
          <ArtistCard key={a.id} index={i} slug={a.slug} stage_name={a.stage_name} photo_url={a.photo_url} hometown={a.hometown} />
        ))}
      </div>
    ) : (
      <EmptyState title="No artists yet." body="..." action={{ href: "/sign", label: "Sign with us" }} />
    )}
  </div>
</section>
```

Yellow hero block with a photo printed beside it:

```tsx
<section className="grid md:grid-cols-[1.15fr_1fr]">
  <div className="relative bg-yellow text-black px-4 sm:px-7 pt-10 pb-16 md:pr-[84px] md:pb-10 min-w-0">
    <PosterHeadline as="h1" size="poster">Pressed in Montego Bay.</PosterHeadline>
    <p className="type-lead mt-4 max-w-[30ch]">...</p>
    <LinkButton href="/artists" variant="outline" ground="yellow" className="mt-8">Hear the roster</LinkButton>
    <GrilleBand className="absolute left-0 right-0 bottom-0 h-[42px] md:left-auto md:inset-y-0 md:w-[60px] md:h-auto" />
  </div>
  <div className="relative min-h-[220px]">
    <PrintedPhoto tone="yellow" src="/hero-bg.jpg" alt="Live performance at an outdoor venue in Montego Bay" fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
    <SpeakerRings ground="photo" size={120} className="absolute right-2 top-2" />
  </div>
</section>
```

On yellow the main button would vanish into the block, so use `variant="outline"` there (or `primary` with `ground="yellow"` for the black focus ring).

## Text links

Underlined, coloured for the ground: `text-yellow` on black, `text-red` on paper, `text-black` on yellow, plus the matching `focus-on-*`. No arrows, ticks or emoji; say what happens in words ("All artists", "Opens Instagram").

## Phone rules (check every page at 375px)

- Nothing may scroll sideways. Use `min-w-0` on grid and flex children that hold long text, and `[overflow-wrap:anywhere]` on names and titles.
- Roster tiles: `grid-cols-2` on phones, `lg:grid-cols-4`. Release cards: two-up or a horizontal scroller with fixed-width items.
- Heroes stack: headline block first, photo under it; the grille becomes a 42px strip along the bottom of the colour block.
- Poster and headline type already scale with `clamp()`. Never set a fixed size above 64px without the five-word check.
- Buttons are 46px tall; keep tap targets at least 44px.
- Tables (if any) scroll inside one `overflow-x-auto` box with a `min-w-[Npx]` table; never nest `overflow-hidden` around it.

## Do not

- Use `rounded-*` (only `rounded-full` for the lens, rings and grille), gradients, glows, blur, soft shadows, `drop-shadow`, hover zoom or darkened photo overlays.
- Put the original logo on black or red, or the grille over a photo or behind text.
- Use raw hex in `className`, or the old tokens and fonts.
- Invent copy, dates, events, prices or history. Use only what the page already says or what the brand book quotes as real copy.
