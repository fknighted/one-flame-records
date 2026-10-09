# One Flame Records brand book

One Flame Records is an independent reggae and dancehall label in Montego Bay, Jamaica. It also runs Flames Lounge, a creative space with an outdoor recording studio, a gaming lounge, a kitchen and a bar. One app serves all of it: the public site, a portal for signed artists, the label's admin, the bar till (the screen bar staff use to run customer tabs) and a portal for gaming members.

The look is called **Sound System**: a Montego Bay dance poster made for the web. Every page should feel like a flyer pasted on a wall: one loud headline, a flat block of colour, the name or the date, and the flame stamped in the corner. It is built from lettering and colour first, so it looks finished even while the site has few photos and no releases. Photos are printed in three tones (black, the block colour and white), the way flyers are printed, so ordinary phone photos look deliberate and bright.

Four principles carry everything below:

- **Stack it big.** One headline per screen, set huge and tight, one word per line where it fits. If two things shout, neither is heard.
- **Flat blocks, no blur.** Colour comes in solid blocks with hard edges. No gradients, glows, soft shadows or rounded cards. The one pattern is the speaker grille, and it runs beside a photo, never over it.
- **The flame always shows.** Original logo on yellow or paper, light logo on black or red. Never the original straight on black or red.
- **Green lives in the flame.** Green is for small, good news only. It never fills a page, so the brand never reads as a tourist flag.

## Voice and content

- Sound like a flyer and the back of a record sleeve, not a tourism advert. Confident, grounded, specific. Short sentences, active verbs, real details.
- Write as the label: "we". Talk to the artist or visitor as "you". "We sign artists, not sounds. If the music is rooted, honest and built to last, we want to hear it."
- Headlines are set in `poster` or `headline` and are always uppercase on screen (the type style does it; write them in sentence case in the source). They often end with a full stop: "Pressed in Montego Bay." "Sign with One Flame." Five words or fewer (see "The five-word rule").
- Body text is sentence case and never set in capitals. Only short button words and `label` tags are capitals.
- **"Mo'Bay"** is allowed in headlines and social posts, because it is how people say the city's name ("Pressed in Mo'Bay."). Body text always says **Montego Bay**. No other Jamaican Patois for flavour unless the artist wrote it.
- Text links are plain words ("All artists", "Follow @flamesmobay"). The concept uses no arrows or ticks, so prefer saying what happens in words ("Copied", "Opens Instagram") over the old →, ↗ and ✓ characters.
- Never write "Welcome to our family!", "Vibes only", "irie" used ironically, or "soulful" used straight. No tropical-paradise clichés.
- Do not invent slogans, values, awards, chart positions, stream counts, sales figures, prices, opening hours, an address or a phone number. None are published.
- **No invented events or dates.** A flyer layout makes it tempting to write a date and a line-up. Only publish ones that are confirmed.
- **No false history.** Never repeat the old About page timeline. Frank confirmed on 2026-10-05 that its founding story and "ten million combined streams" are not true; the rest of that timeline (first release, distribution deal, radio play) is untraced and went with it. It was removed from the site on 2026-10-05, along with "Distribution is worldwide." Never claim a founding date, a distribution deal, a stream count, chart play or an award.
- **The studio line is true.** "Production, mixing, and video work happen in-house at our Montego Bay studio" was confirmed by Frank on 2026-10-05 and may be repeated. This means the physical recording studio, not software.
- Never announce a release date, title or featured artist that is not confirmed. Name artists and releases exactly as credited. Never speak for an artist in the first person: an artist's biography is in their own words, written or approved by them.
- Money in the bar and gaming screens is whole Jamaican dollars, shown as "$600" with no cents. Never quote a food or drink price outside the till.
- No emoji anywhere: not on the site, in headlines or on posters.

Real copy to model on:

> Pressed in Montego Bay.

> You keep your publishing. We handle the platform.

> We sign artists, not sounds. If the music is rooted, honest and built to last, we want to hear it.

> Walk-in welcome, no reservation needed.

> No releases yet. The first ones are in the studio. Get the drop in your inbox.

A Lounge line that broke these rules ("just here for the vibes") was rewritten on 2026-10-05 as "just here to hang out". Do not bring the old wording back.

## Colour

Five colours, one theme (`sound`). Every colour keeps its value everywhere; there is no light and dark mode.

| Token | Hex | Job |
| --- | --- | --- |
| `black` (Sound black) | #0F0D0B | The wall. The main ground for the public site and every studio screen. |
| `yellow` (Poster yellow) | #F2C230 | The lead colour. Headline blocks, the main button, money on the till. |
| `red` (Flame red) | #C8321F | The second block. Artist pages, release tags, the Lounge. |
| `paper` | #FFF7E6 | The reading ground for long text and forms, and the main text colour on black. |
| `green` (Inner green) | #2F6B3A | Small doses only: open, live, paid, done. |

Supporting tokens, never used as blocks of their own:

- `muted` (#D8CCB4) — supporting text on `black` (12.2:1), such as intros under a heading, table headings and footers.
- `line` (#3A332B) — hairline dividers on `black`: table rows, card edges in studio screens. It is decoration (1.6:1 against black), never the only edge of a control.
- `panel` (#16130F) — the slightly lifted ground of a studio panel such as the till's tab list. Same text rules as `black`.
- `raised` (#2A241E) — the fourth colour in a row of roster tiles, after yellow, red and paper, so the row does not vanish into the wall.
- `lens` — `black` at 50%, the dark see-through circle behind the light logo on a photo.

The logo keeps its own colours: oxblood `logo-red` (#902721) and olive `logo-green` (#3A482F). `red` is deliberately brighter, so poster blocks feel loud while the logo stays the logo. Never recolour the logo file to match the palette, and never use the logo colours for anything else.

Rules:

- Lead with `black` and `yellow`. `red` is the second block. `paper` is for reading. `green` is a small mark.
- Text on `yellow` is always `black`. Text on `red` is `paper` (or `black` only at 24px and up). Text on `green` is `paper`.
- `yellow` is never text on `paper` (1.6:1) and `paper` is never text on `yellow`.
- `green` text or icons on `black` fail for small sizes (3.0:1). Put status on a `green` chip with `paper` text instead.
- Red, yellow and green together across a whole page reads as tourist Rasta merchandise. Keep green small and never let the three run side by side as equal stripes.
- Errors: on `paper`, error text is `red` (5.0:1). On `black`, show an error as a `red` strip with `paper` text (5.0:1); `red` text on black is only 3.6:1. Always say the problem in words, never colour alone.

### Contrast

Measured with the standard web formula for contrast (WCAG 2, the Web Content Accessibility Guidelines) by a script, not by eye. Readable text needs 4.5:1. Lettering 24px and up, control edges and focus rings need 3:1.

| Text or mark | On | Contrast | Use |
| --- | --- | --- | --- |
| `black` | `yellow` | 11.6:1 | Anything |
| `yellow` | `black` | 11.6:1 | Anything |
| `paper` | `black` | 18.2:1 | Anything |
| `muted` | `black` | 12.2:1 | Anything |
| `paper` / `yellow` / `muted` | `panel` | 17.4 / 11.1 / 11.7:1 | Anything |
| `paper` | `raised` | 14.4:1 | Anything |
| `paper` | `red` | 5.0:1 | Anything |
| `red` | `paper` | 5.0:1 | Anything |
| `black` | `paper` | 18.2:1 | Anything |
| `paper` | `green` | 6.0:1 | Anything (status chips) |
| `green` | `paper` | 6.0:1 | Anything ("Paid" on a form) |
| `red` | `yellow` | 3.2:1 | Lettering 24px and up only |
| `yellow` | `red` | 3.2:1 | Lettering 24px and up only |
| `black` | `red` | 3.6:1 | Lettering 24px and up only |
| `red` | `black` | 3.6:1 | Lettering 24px and up, or a control edge |
| `muted` | `red` | 3.4:1 | Lettering 24px and up only |
| `yellow` | `green` | 3.8:1 | Lettering 24px and up only; avoid |
| `black` | `green` | 3.0:1 | Avoid for text; just clears 3:1 as an edge |
| `green` | `black` | 3.0:1 | Avoid for text |
| `yellow` | `paper` | 1.6:1 | Never |
| `line` | `black` | 1.6:1 | Decoration only |
| `logo-red` (original logo) | `yellow` / `paper` | 5.0 / 7.9:1 | Logo reads well |
| `logo-red` (original logo) | `black` / `red` | 2.3 / 1.6:1 | Never; use the light logo |

Every value in the concept's own table was checked and matches to one decimal place. The `muted`, `panel`, `raised` and `yellow`-on-`green` rows are added here.

## Type

Two families, both Google fonts:

- **`poster`: Big Shoulders Display**, weights 700, 800 and 900. Every headline, name and number. Tall, heavy and condensed like the stacked type on sound-system flyers, and close in spirit to the lettering in the logo. Always uppercase in headlines.
- **`text`: Archivo**, weights 400, 500, 600 and 800. Everything people read: intros, forms, lists, the till. Sentence case. Capitals only for short button words and `label` tags (800, tracked).

There is no third, fixed-width font. Money and counts on the till are set in `poster` with even-width figures requested (`tabular-nums`), as the concept shows; times and codes are `text` with even-width figures.

Size by role:

| Style | Family, weight | Size and leading | Use |
| --- | --- | --- | --- |
| `poster` | poster 900 | 112px, 0.82 | Home hero, Lounge hero, social posts. Scales down to 56px on phones. |
| `headline` | poster 900 | 56px, 0.85 | Page and section openers. 36px on phones. |
| `title` | poster 800 | 32px, 0.95 | Names, card titles, and any long headline that drops a size. |
| `title-sm` | poster 800 | 24px, 1 | Small titles: list rows on the Lounge page, studio panel heads, tab names. |
| `number` | poster 900 | 44px, 1 | Big counts and money totals ("$600"). |
| `money` | poster 800 | 24px, 1 | Amounts in till rows, in `yellow`. |
| `lead` | text 600 | 18px, 1.5 | The line under a hero or headline. |
| `body` | text 400 | 17px, 1.6 | Anything read at length. Keep lines under 66 characters. |
| `body-sm` | text 400 | 16px, 1.6 | Form inputs, table cells, card bodies. |
| `button` | text 800 | 15px, 1, uppercase, +0.04em | Button labels only. |
| `label` | text 800 | 13px, uppercase, +0.06em | Tags ("Single", "Walk-in welcome"), the phone menu button. |
| `small` | text 600 | 13px, 1.4 | Navigation, table headings, meta lines, field labels at 14px. |
| `caption` | text 600 | 12px, 1.4 | Tiny supporting lines under a tile name ("Signed to One Flame"). |

### The five-word rule

`poster` and `headline` are for five words or fewer. Anything longer (a long song title, an artist with a long name, a sentence) drops to `title` automatically, so it never breaks a layout or runs off a phone screen. Count words, not letters, and also drop a size if one word is longer than 12 letters at `poster`. This is a rule for the code, not for the writer: a component that renders a headline checks the word count.

## Layout and spacing

- Content is centred at `content-max` (1152px), with a `gutter` of 16px on phones and `gutter-wide` 24px from 640px up.
- Long reading (About, legal, an artist's biography) sits on `paper` in `read-max` (66 characters wide).
- Public sections are full-width blocks of one colour: black, yellow, red or paper. A page stacks them like flyers. Pad sections `space-22` (88px) top and bottom on desktop and `space-14` (56px) on phones.
- Spacing comes from the `space-*` steps (4px to 96px). Inside blocks use `space-4` to `space-7`; between blocks use the block edge itself, not a gap.
- One layout rearranges itself for phones: the menu folds into a `Menu` button, the photo moves under the headline, roster tiles go from four columns to two, and the Lounge block stacks. Check every page at 375px wide.
- Grids of tiles and cards use an 8px gap (`space-2`), tight like a pasted wall.
- Tables in studio screens scroll sideways inside one box with a minimum width, so columns never squash on a phone.

## Edges, corners and depth

- **Square corners everywhere** (`radius-none`). Buttons, fields, cards, tiles, photos and tags are square. `radius-round` exists only for the dark see-through circle behind the logo on a photo, the speaker rings and the grille's holes.
- No gradients, no glow, no soft shadows, no lift on hover. The old darkened photo overlay and the paper grain go.
- Edges are solid and visible: `border-field` (2px) for fields, outlined buttons and tags; `border-rule` (3px) to divide a release card; `border-band` (4px) yellow under the site header; `border-hair` (1px) `line` for table rows on black.

## Controls and states

Buttons are `control-height` (46px) tall, square, `button` type, `space-5` (18 to 20px) side padding.

- **Main button: `yellow` fill, `black` text.** One per screen. Hover turns the fill `paper` (black text stays, 18.2:1).
- **Second button: outlined.** `black` fill, `yellow` text, a 2px `yellow` edge inside the button. On a yellow block it reads as a solid black button. Hover fills it `yellow` with `black` text.
- **Lounge button: `red` fill, `paper` text** (5.0:1). Only for Lounge actions ("Visit the Lounge").
- **Text link:** `yellow` on black, `red` on paper, `black` on yellow, always underlined.
- **Tags:** `label` type. Release tags are a `red` band with `paper` text. Plain tags are a 2px `black` edge on paper or yellow.
- **Status chips (studio screens):** a `green` chip with `paper` text for open, live, paid or done; a `red` chip with `paper` text for failed or overdue; a 1px `muted` edge with `muted` text for neutral states. Always the word, never colour alone.

**Fields always sit on `paper`.** Long typing on yellow or black is hard on the eyes. A field is `control-height` tall with a `paper` (or white) fill, a 2px `black` edge (18.2:1 on paper), `body-sm` text in `black`, and a `small` label above it in `black`. Placeholder text is not a label.

**Focus is always visible and always solid.** Use a 3px outline (`focus-width`) with a 2px gap (`focus-offset`), coloured for the ground the element sits on:

| Ground | Focus ring | Contrast |
| --- | --- | --- |
| `paper` (all forms) | `red` | 5.0:1 |
| `black`, `panel` | `yellow` | 11.6:1 or more |
| `yellow` | `black` | 11.6:1 |
| `red` | `paper` | 5.0:1 |

Never remove the browser outline without this replacement. A yellow ring on a yellow block disappears; that is why the ring changes with the ground.

## Logo

The flame and the name lettering stay exactly as drawn. The vector files in the Logos group come from the real logo files: same shapes, only the colours change.

- **Original** (`*-original.svg`, oxblood flame and lettering, olive inner flame): on `yellow` or `paper` only.
- **Light** (`*-light.svg`, paper flame and lettering, yellow inner flame): on `black` or `red`.
- **One colour**: `*-paper.svg` on dark grounds and `*-black.svg` on light grounds, for print, stamps, merch and very small sizes.
- **Never put the original on black or red** (2.3:1 and 1.6:1; it all but vanishes).
- **On a photo:** the light logo inside the dark see-through circle (`lens`). Never a solid circle behind the logo, on any ground.
- Plain flame on flat colour for small sizes, the site header and footers. Use the speaker rings for hero moments and posts, and the corner block for photos in grids and cards.
- Never redraw, stretch, add effects to, or separate the flame from its inner flame. Minimum size 32px tall; clear space of half the flame's width on every side.
- The name lettering beside the flame stays as it is for now.

### Speaker rings, corner block and the grille

- **Speaker rings** come from the speaker cones of a sound system. Three thin rings (2.5px) around the flame at 44%, 66% and 88% of the radius, fading out: full, 55% and 28% strength. Dark rings (`black`) with the original logo on yellow; light rings (`paper`) with the light logo on red. On a photo, dark rings around the light logo in its `lens` circle. Sizes: `rings-hero` (190px) on a hero, `rings-post` (118 to 132px) on posts and the home photo. Recommended for hero moments and posts.
- **Corner block** borrows the price tag on a flyer: a square of colour, `corner-block` (72 to 78px), flush in the top-right corner of a photo or card, with the flame centred in it. `black` block with the light logo on photos and yellow cards; `yellow` block with the original logo on red. Recommended for photos in grids and cards.
- **The speaker grille** is the one pattern: rows of round holes, like the front of a speaker box. `yellow` holes on `black` (or `red` holes on `black`), each `grille-hole` (9px) across at a `grille-pitch` of 18px. Big holes only. It runs only as a band beside a photo or along the edge of a headline block: `grille-band` (60px) on the home hero, `grille-band-wide` (92px) on covers, and a 40 to 46px strip across the top or bottom on phones and stories. Never over a photo, never as a full background, never behind text.
- An off-register print effect was tried and dropped because the flame looked doubled. Do not bring it back.

## Photos

- Real photographs only: the label's artists, its shows, its studio and its own spaces. Never a stock or AI image presented as an artist, a show or the Lounge.
- **Every photo is printed in three tones:** `black` for the shadows, the block colour it sits on (`yellow` or `red`) for the middle, and white (`paper`) for the highlights. The white is what makes lights glow and faces read. Use the middle strength on every colour: enough white to lift the lights and faces while it still reads as a print. Black and one colour only is too dark; more white stops looking printed.
- **Green is never used for photos.** Photos are never printed in `paper` or `black` alone either.
- This happens automatically when a photo is shown, so nobody edits photos by hand. The original upload is kept untouched.
- Photos have square corners and fill their block edge to edge. Text never sits on a photo; it sits in a black or colour box beside or over the edge of it.
- Alt text says who or what is in the photo and where ("Live performance at an outdoor venue in Montego Bay").
- Avoid tourism imagery: palm-tree postcards, beach paradise, theme-park Jamaica.

## Building blocks

- **Section opener:** a `headline` title with a short, thick `red` bar under it (`section-bar-width` 72px by `section-bar-height` 8px; 64 by 7 inside the home page). It replaces the old eyebrow, title and thin rule. No eyebrow above it.
- **Artist tile, no photo:** until there is a photo, the tile is the artist's initial at `poster` size on a colour block, with the stage name in `title` and one `caption` line ("Signed to One Flame"). Square. Roster tiles cycle `yellow`, `red`, `paper`, `raised`. It looks intentional instead of empty.
- **Artist tile, with photo:** the photo printed in the tile's block colour, the corner block top right, the name in a `black` box along the bottom edge.
- **Release card:** a small poster, 4:5. A `red` band on top with the type tag ("Single", `label`, `paper`), the title in `headline` (or `title` when longer than five words) on `paper`, then a 3px `black` rule and a bottom row with the artist and "Listen". Cover art fills the middle when there is one, square and uncropped.
- **Empty page:** an invitation with one action instead of "Coming soon". A `black` panel with a 3px dashed `yellow` edge, a `title`, one line of `body` and one main button. "No releases yet. The first ones are in the studio. Get the drop in your inbox." then "Get release news".
- **Form block:** a `paper` block with a `headline`, one line of `body` and the field and button in a row ("Sign with One Flame." / "You keep your publishing. We handle the platform." / Subscribe).
- **Site header:** `black`, the plain light horizontal logo at left, navigation in `small` `paper`, a 4px `yellow` line along the bottom. On phones the links fold into an outlined `yellow` `Menu` button.
- **Footer:** `black`, `muted` text, the light stacked logo, "Montego Bay, Jamaica".
- **Home page:** the yellow poster block with the headline and the main photo printed over yellow beside it, a grille band between, then the roster as colour tiles, the Lounge as a red block, the form block on paper and the footer.

## Flames Lounge and the bar

- Flames Lounge is Montego Bay's creative space, part of One Flame Records: an outdoor studio (record where the label works), a gaming lounge (members and walk-ins), a kitchen (Jamaican food) and a bar (drinks and a tab). "Walk-in welcome, no reservation needed."
- The Lounge's block colour is `red`. Its hero is `black` with a `poster` headline in `paper` and `yellow`, and a list of the four spaces in `title-sm` divided by 2px `line` rules. Its buttons are the red Lounge button.
- Menu items name the food plainly and never show a price. Name events only once they are confirmed.
- There are no real photos of the Lounge yet. Until the owner supplies them, the Lounge uses colour blocks and type only. Never use a stock or AI image as the Lounge. The old stock file `public/flames-lounge-hero.jpg` was deleted on 2026-10-05; do not bring it back.
- The Lounge posts as @flamesmobay.

## Studio screens

The artist portal, the label admin, the bar till and the gamer portal stay calm. Staff use them for hours, often at night, so readability beats attitude.

- `black` ground (`panel` for lifted panels), `paper` text, `muted` supporting text, `line` dividers, the new type.
- No stripes, no grille, no speaker rings, no colour blocks behind content.
- No huge type, except money and counts (`number`, `money`).
- `yellow` only for the one main action on the screen and for amounts. Everything else is outlined or plain.
- Status uses the chips above: green for open, live, paid, done.
- The bar till is tuned for speed on a phone behind a bar: one big `yellow` "New tab" button, the open tabs in a table with the amount right-aligned in `money` `yellow`.
- Money is whole Jamaican dollars ("$600", "$2,400"), as the till already shows it. Gaming time is sold in 30- and 60-minute sessions.
- Change how these screens look, never how they work.

## Guardrails

- **No flag look.** Red, yellow and green together across a page reads as tourist Rasta merchandise. Green stays small.
- **No original logo on black or red.** Use the light version there; on photos add the dark see-through circle.
- **No invented events or dates.** Only publish confirmed ones.
- **No false history.** Never bring back the removed founding story, distribution deal or stream count.
- **No gradients, glow or soft shadows.** Flat blocks only.
- **No rounded cards** and no solid circle behind the logo.
- **No grille over photos** or behind text.
- **No emoji.**
- **No more than five words** at `poster` or `headline` size.

## Not synced

From the approved concept, "One Flame Sound System" (https://claude.ai/artifact/DRRtVLep9ki5pNCDPV3Mo5, version 8, direction B chosen by Frank on 2026-10-08), and from `fknighted/one-flame-records` at `main@807859f` for the logo files and app structure.

- **The live site is still on the old record-sleeve look** (cream, oxblood, Fraunces). Nothing on the site changes until Frank approves the rebuild. "Building in the app" describes the target, not the current code.
- **Fonts:** none fetched. Big Shoulders Display and Archivo are Google fonts, to be loaded with `next/font`.
- **Logos:** the twelve vector files are from the repository's `brand/vector/` folder, which is not yet committed. The six old PNG logos stay as legacy files.
- **Photo printing:** the three-tone settings in "Building in the app" are a written-down version of the concept's sample images; check them against the concept by eye before the rebuild.
- **Components:** no live previews. The real components stay in the repository.
