# One Flame Records tokens

Generated from `tokens.json`. Edit the JSON, not this file.

## Color

| Token | Value | Usage |
| --- | --- | --- |
| `black` | `#0f0d0b` | Sound black, the wall. Main ground for the public site and every studio screen (artist portal, admin, bar till, gamer portal). Text on it: paper (18.2:1), yellow (11.6:1), muted (12.2:1). Also the text colour on yellow (11.6:1) and paper (18.2:1), the 2px edge of fields on paper, and the focus ring on yellow. Never pure black. |
| `yellow` | `#f2c230` | Poster yellow, the lead colour. Headline blocks, the main button (one per screen, black text 11.6:1), money and amounts on the till, text links and the focus ring on black (11.6:1), the 4px line under the site header, grille holes. Text on it is always black. Never text on paper (1.6:1). |
| `red` | `#c8321f` | Flame red, the second block. Artist pages, release tags, the Lounge block and the Lounge button, the thick bar under every section title, the focus ring on paper (5.0:1), error text on paper (5.0:1). Text on it: paper (5.0:1); black, yellow or muted only at 24px and up (3.6, 3.2, 3.4:1). As text on black it is 3.6:1, so only 24px and up. Brighter than the logo's own red on purpose. |
| `paper` | `#fff7e6` | The reading ground for long text and forms (About, biographies, the form block), and the main text colour on black (18.2:1), red (5.0:1) and green (6.0:1). The white of three-tone photos. Fill of form fields. Focus ring on red (5.0:1). |
| `green` | `#2f6b3a` | Inner green, small doses only: open, live, paid, done. A chip with paper text (6.0:1), or text on paper (6.0:1). Never a block, a page ground or a photo tone. As text on black it fails (3.0:1). Never beside equal red and yellow blocks (the flag look). |
| `muted` | `#d8ccb4` | Supporting text on black (12.2:1), panel (11.7:1) and raised: intros, table headings, meta lines, the footer. On red only at 24px and up (3.4:1). Not for paper or yellow grounds. |
| `line` | `#3a332b` | Hairline dividers on black and panel: table rows, studio card edges, Lounge list rules. Decoration only (1.6:1 on black), never the only edge of a control. |
| `panel` | `#16130f` | A lifted studio panel on black, such as the bar till's open-tabs box. Same text rules as black (paper 17.4:1, yellow 11.1:1, muted 11.7:1). Not a public-site block. |
| `raised` | `#2a241e` | The fourth colour in a row of roster tiles, after yellow, red and paper, so the row does not vanish into the black wall. Paper text on it 14.4:1, yellow 9.2:1. |
| `lens` | `#0f0d0b80` | Black at 50%: the dark see-through circle behind the light logo on a photo. The only circle allowed behind the logo; never solid. |
| `logo-red` | `#902721` | The logo's own oxblood (outer flame and lettering of the original files). Reference only: never recolour the logo to the palette, and never use this colour for text or blocks. The original logo reads 5.0:1 on yellow and 7.9:1 on paper, but only 2.3:1 on black and 1.6:1 on red. |
| `logo-green` | `#3a482f` | The logo's own olive inner flame in the original files. Reference only: never used for text, blocks or status (that is green). |

## Spacing

| Token | Value | Usage |
| --- | --- | --- |
| `space-1` | `4px` | Tightest gaps: tag padding, the gap between a title and its bar. |
| `space-2` | `8px` | Gap in tile, card and button rows (the tight pasted-wall grid). |
| `space-3` | `12px` | Tile and release-card inner padding; table cell vertical padding. |
| `space-4` | `16px` | Phone page gutter; default padding inside small blocks and studio panels. |
| `space-5` | `20px` | Button side padding (18 to 20px); padding of section samples. |
| `space-6` | `24px` | Gutter from 640px up; padding inside home and Lounge blocks. |
| `space-7` | `28px` | Hero copy padding on desktop. |
| `space-8` | `32px` | Space between a lead and its button on heroes. |
| `space-10` | `40px` | Space between stacked blocks inside one section. |
| `space-14` | `56px` | Section padding top and bottom on phones; cover headline top padding. |
| `space-22` | `88px` | Section padding top and bottom on desktop. |
| `space-24` | `96px` | Largest step: space at the end of a long page. |

## Radius

| Token | Value | Usage |
| --- | --- | --- |
| `radius-none` | `0` | Every button, field, card, tile, tag and photo. The brand is square. |
| `radius-round` | `9999px` | Only the dark see-through circle behind the logo on a photo, the speaker rings and the grille holes. Never a card, button or solid logo circle. |

## Border

| Token | Value | Usage |
| --- | --- | --- |
| `border-hair` | `1px` | line dividers on black: table rows, studio card edges. |
| `border-field` | `2px` | Fields on paper (black, 18.2:1), the inner yellow edge of the outlined button, plain tags, Lounge list rules. |
| `border-rule` | `3px` | The black rule dividing a release card; the dashed yellow edge of an empty-state panel. |
| `border-band` | `4px` | The yellow line under the site header and between a Lounge block's text and photo. |
| `focus-width` | `3px` | Focus outline width on every interactive element: red on paper, yellow on black, black on yellow, paper on red. |
| `focus-offset` | `2px` | Gap between an element and its focus outline (3px on the public site's large buttons). |

## Layout

| Token | Value | Usage |
| --- | --- | --- |
| `content-max` | `1152px` | Maximum content width, centred (Tailwind max-w-6xl). |
| `read-max` | `66ch` | Line length for long reading on paper. |
| `gutter` | `16px` | Side gutter on phones. |
| `gutter-wide` | `24px` | Side gutter from 640px up. |
| `control-height` | `46px` | Height of every button and field. Square corners. |
| `section-bar-width` | `72px` | Width of the thick red bar under a section title (64px inside the home page). |
| `section-bar-height` | `8px` | Thickness of the red bar under a section title (7px inside the home page). |
| `grille-pitch` | `18px` | Distance between speaker-grille holes, across and down. |
| `grille-hole` | `9px` | Diameter of one grille hole (big holes only). |
| `grille-band` | `60px` | Width of the grille band beside the home hero photo; 40 to 46px tall when it runs across a phone layout or a story. |
| `grille-band-wide` | `92px` | Width of the grille band on a cover or poster-size block. |
| `corner-block` | `72px` | Side of the square corner block holding the flame on a photo or card (78px on posts). |
| `rings-hero` | `190px` | Speaker rings around the flame on a hero photo or cover. |
| `rings-post` | `120px` | Speaker rings on the home photo and social posts (118 to 132px). |
| `logo-min` | `32px` | Smallest height of any logo file. |
| `story-safe-top` | `250px` | Keep text out of the top of a 1080 by 1920 story. |
| `story-safe-bottom` | `340px` | Keep text out of the bottom of a 1080 by 1920 story. |

## Type

Families:

- `poster`: "Big Shoulders Display", Oswald, Impact, "Arial Narrow", sans-serif
- `text`: Archivo, system-ui, -apple-system, "Segoe UI", sans-serif

### Poster (`poster`)

| Style | Size / line | Weight | Sample | Usage |
| --- | --- | --- | --- | --- |
| `poster` | 112px / 0.82, tracking -0.01em | 900 | Pressed in Montego Bay. | Home hero, Lounge hero and social posts only. Uppercase. Five words or fewer, one word per line where it fits; longer text drops to title. Fluid: clamp(56px, 9vw, 112px); covers and posters may run to 150px. Black on yellow, paper or yellow on black, paper on red. |
| `headline` | 56px / 0.85 | 900 | Sign with One Flame. | Page and section openers, always with the short thick red bar under it. Uppercase. Five words or fewer; longer drops to title. clamp(36px, 7vw, 64px). |
| `title` | 32px / 0.95 | 800 | The roster | Uppercase. Names, card titles, empty-state titles, and any poster or headline text longer than five words. |
| `title-sm` | 24px / 1, tracking 0.01em | 800 | Outdoor studio | Uppercase. Small titles: Lounge list rows, studio panel heads, tab names on the till. The smallest poster size; it is the floor for red on black or black on red (3.6:1). |
| `number` | 44px / 1 | 900 | $600 | Big counts and money totals in studio screens and stat tiles. Even-width figures (tabular-nums). Yellow for money, paper for counts. |
| `money` | 24px / 1 | 800 | $2,400 | Amounts in bar till rows, right-aligned, in yellow, tabular-nums. Whole Jamaican dollars, no cents (formatJmd). Replaces the old fixed-width font. |

### Text (`text`)

| Style | Size / line | Weight | Sample | Usage |
| --- | --- | --- | --- | --- |
| `lead` | 18px / 1.5 | 600 | Independent reggae and dancehall. We sign artists, not sounds. | The line under a hero or headline. 16px inside the home hero. Black on yellow, paper on black or red. |
| `body` | 17px / 1.6 | 400 | We sign artists, not sounds. If the music is rooted, honest and built to last, we want to hear it. | Anything read at length, best on paper. Sentence case, under 66 characters a line. |
| `body-sm` | 16px / 1.6 | 400 | You keep your publishing. We handle the platform. | Form inputs, table cells, card bodies, the page default. |
| `button` | 15px / 1, tracking 0.04em | 800 | Hear the roster | Uppercase. Button labels only, inside a 46px square button. Short words. |
| `label` | 13px / 1.2, tracking 0.06em | 800 | Walk-in welcome | Uppercase. Tags (release type, 'Walk-in welcome'), the phone Menu button, 'more' links under a grid. Replaces the old eyebrow; never above a headline. |
| `small` | 13px / 1.4 | 600 | Artists  Releases  Videos  Flames Lounge | Navigation, table headings (muted), meta lines, footer. Field labels use the same weight at 14px. |
| `caption` | 12px / 1.4 | 600 | Signed to One Flame | The tiny line under a tile name, status chips. |
