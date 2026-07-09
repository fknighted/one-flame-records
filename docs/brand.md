# Brand system

The visual and verbal identity for One Flame Records. Reference this any time you're touching styling or copy.

## Visual direction

Roots/vintage Studio One homage with a modern web execution. Two environments:

- **Cream** — public site, about, artist bios, press. Feels like a printed record sleeve label. Paper grain, restrained ink, confident typography.
- **Ink** — artist portal, video player pages, admin. Studio mode. Dark background so media and waveforms pop. Same inks, inverted environment.

Never mix the two worlds on the same page. Choose by route group via layout class.

## Color tokens

Define once in `tailwind.config.ts`. Reference everywhere via Tailwind utilities.

```ts
// tailwind.config.ts excerpt
colors: {
  oxblood:  '#8B2A1F',  // primary ink, headlines, the flame
  forest:   '#3F5A3A',  // secondary ink, inner flame, accents
  cream:    '#ECE2C8',  // public background
  ink:      '#1A1612',  // portal background
  bone:     '#F5EDD8',  // text on ink
  ochre:    '#B8893B',  // CTAs, badges, hover — sparingly
}
```

Usage rules:

- **Body text on cream:** `text-ink` (the warm black, not pure `#000`)
- **Body text on ink:** `text-bone` (the warm off-white, not pure `#FFF`)
- **Headlines anywhere:** `text-oxblood`
- **Links:** `text-oxblood` with `underline-offset-4 hover:text-ochre`
- **Buttons (primary):** `bg-oxblood text-bone hover:bg-ochre`
- **Buttons (ghost):** transparent with `border border-oxblood text-oxblood hover:bg-oxblood hover:text-bone`
- **Badges (e.g. "New release"):** `bg-ochre text-ink`

Ochre is the trap. It's a strong color. Use it where you actively want attention — a single CTA, a "new" badge, a hover state — never as a body or surface color.

## Typography

Three typefaces, all served via `next/font` for performance.

| Role | Font | Weight | Notes |
|---|---|---|---|
| Display (headlines, the wordmark feel) | **Cooper Std** or **Recoleta** | 700 | A chunky retro slab serif. Vintage reggae sleeve. Use sparingly — H1 and section headers only. |
| Body | **Söhne** or **Inter** | 400 / 500 | Clean modern sans for everything readable. |
| Mono (for code, hex codes, timestamps in the portal) | **JetBrains Mono** | 400 | |

Free alternatives if licensing is an issue: **Fraunces** (display, very Cooper-adjacent), **Inter** (body), **JetBrains Mono** (mono). All on Google Fonts.

Sizing scale:

```
display-2xl  60px / 1.05  — homepage hero only
display-xl   44px / 1.1   — section headers on public pages
display-lg   32px / 1.15  — sub-section headers, artist names on cards
h1           28px / 1.2
h2           22px / 1.3
h3           18px / 1.4
body         16px / 1.6
small        14px / 1.5
caption      12px / 1.4   — labels, hex codes, metadata
```

## Texture

A subtle paper-grain SVG overlay on cream pages. Defined once as a fixed `<div>` in the public layout with `mix-blend-multiply` and ~6% opacity. Do not apply grain to the ink theme.

## Logo usage

Two SVG variants in `/public/brand/`:

- `logo-cream.svg` — flame in oxblood + forest, wordmark in oxblood. Use on cream backgrounds.
- `logo-ink.svg` — flame in oxblood + forest, wordmark in bone. Use on ink backgrounds.

Minimum size: 32px tall. Clear space around the mark: at least half the flame's width on every side. Never recolor, rotate, stretch, or add effects.

The "MONTEGO BAY · JAMAICA" lockup is the formal version. A simplified version without the locality line exists as `logo-mark.svg` for tight spaces (favicons, embedded thumbnails, social avatars).

## Component recipes

These show up across many pages. Define once in `src/components/` and reuse.

**ArtistCard** — flame mark in corner, photo (1:1 aspect), stage name in display font, hometown in caption. On cream: cream surface, oxblood text. On ink: ink surface with `border border-oxblood/30`.

**ReleaseCard** — square cover image, title, artist, release date, type pill (single / EP / album). Streaming icons as a row at the bottom.

**VideoEmbed** — 16:9 YouTube iframe with a custom thumbnail and play overlay. Lazy-loaded. Title and artist below.

**SectionHeader** — display-xl in oxblood, optional eyebrow in caption + ochre, thin oxblood rule below. Sets rhythm on long public pages.

**Footer** — flame mark, the formal wordmark with locality, three columns of links (label, artists, legal), social icons, copyright. Cream surface with oxblood top border. Inverted on ink.

## Voice

Confident, grounded, specific. Never corporate, never theme-park Jamaican.

- **Do:** "Pressed in Montego Bay since [year]." "New from [Artist] — out Friday." "An automated rhythm room for our roster."
- **Don't:** "Welcome to our family!" "Vibes only." Anything that uses "irie" ironically. Anything that uses the word "soulful" unironically.

Copy should feel like the back of a record sleeve, not a tourism ad. Short sentences. Active verbs. Real specifics over vague enthusiasm.

## Imagery

Photography is warm and grounded — natural light, real environments (the studio, the streets, the venues), 35mm-feel grain. Avoid stock-image polish. Avoid stereotypical "tropical paradise" imagery — that's tourism, not the label.

When commissioning photos: ask for high-contrast portraits, warm white balance, hard shadows where possible. Black-and-white treatments work especially well in the ink theme.
