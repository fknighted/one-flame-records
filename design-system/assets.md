# One Flame Records logos and imagery

## Imagery

Real photography the brand uses. There is only one so far.

- `hero-bg.jpg` — a night performance at an outdoor Montego Bay venue: string lights, a hand drum, an audience on benches. Resized here to 1600 × 1200 (the app's copy in `public/` is 1920 × 1440). The file itself is the untouched colour photo. On the site it is always shown printed in three tones, never as it is: `black` shadows, `yellow` middle tones and white (`paper`) highlights on the home hero, or `red` middle tones on a red block, at the middle strength. The old dark overlay and oxblood glow are gone.

Photo rules:

- Real photos only: the label's artists, its shows, its studio and its own spaces. Never a stock or AI-generated image presented as an artist, a show or Flames Lounge.
- Every photo is printed in three tones for the block it sits on, automatically when it is shown. Nobody edits photos by hand, and the upload is kept as it is. Green is never a photo tone.
- Square corners, edge to edge in its block. Text never sits straight on a photo: it goes in a black or colour box beside it or over its edge. The speaker grille runs beside a photo, never over it.
- On a photo, the logo is the light version in a dark see-through circle, in dark speaker rings, or in a black corner block.
- There are no real photos of Flames Lounge yet. The old stock photo of another bar (`public/flames-lounge-hero.jpg`) was deleted from the repository on 2026-10-05; never bring it back.
- Artist photos and release covers live in the label's own storage, uploaded through the portal and admin, not in the repository.
- Write alt text that says who or what is in the photo and where ("Live performance at an outdoor venue in Montego Bay").

## Logos

The One Flame Records logo: a flame with an inner flame, beside or above "ONE FLAME" in its own condensed lettering. The shapes never change; only the colours do. The SVG files are flat colour, traced from the real logo files (outlines within 1 pixel at 2560px wide) with every letter outlined, transparent counters and no background. The printed speckle of the original PNGs is not in the vectors.

Each SVG uses fixed colours, so `<img>` cannot recolour it. Pick the file by the ground it sits on:

| Version | Ink | Use on |
| --- | --- | --- |
| `*-original.svg` | Outer flame and lettering oxblood #902721 (`logo-red`), inner flame olive #3A482F (`logo-green`) | `yellow` (5.0:1) or `paper` (7.9:1) only. Never on black (2.3:1) or red (1.6:1). |
| `*-light.svg` | Outer flame and lettering paper #FFF7E6, inner flame yellow #F2C230 | `black` or `red`, and on photos inside the dark see-through circle. |
| `*-paper.svg` | Paper #FFF7E6 only | One colour on dark grounds: print, stamps, merch, tiny sizes. |
| `*-black.svg` | Black #0F0D0B only | One colour on light grounds: print, stamps, merch, tiny sizes. |

Files:

- `flame-original.svg`, `flame-light.svg`, `flame-paper.svg`, `flame-black.svg` — the flame alone, 379 × 648, already trimmed, with its full bottom tip. Favicons, avatars, the corner block, the centre of the speaker rings, the plain flame on posts.
- `horizontal-original.svg`, `horizontal-light.svg`, `horizontal-paper.svg`, `horizontal-black.svg` — the flame beside "ONE FLAME RECORDS", trimmed to the artwork (frame 2385 × 1072). The site header (light, on black), banners, wide signatures. The stray dot above "FLAME" is gone.
- `stacked-original.svg`, `stacked-light.svg`, `stacked-paper.svg`, `stacked-black.svg` — the formal stacked lockup with the location line, trimmed (frame 722 × 949). The footer (light, on black), covers, closing slides.

The untrimmed copies of the horizontal and stacked files (2560 × 1400 and 1080 × 1080, the original PNG canvases) stay in the repository's `brand/vector/` folder; use the trimmed ones here so the logo is not surrounded by empty space.

Legacy files, kept for pages not yet rebuilt and not for new work: `logo.png` (formal stacked lockup, 1080 × 1080), `logo-1.png` and `logo-2.png` (horizontal lockups), `logo-3.png` (flame and "ONE FLAME"), `logo-4.png` (one-line lockup), `icon.png` (the flame, the current favicon). These are the textured originals in oxblood and olive with a lot of empty space around the art; they have no light version.

Rules: never redraw, recolour, stretch, add effects to, or separate the flame from its inner flame. Never put the logo on a solid circle. Minimum size 32px tall; clear space of half the flame's width on every side.

The files themselves are in this repository (see each note for its path) and in the claude.ai design system linked from `README.md`.
