# Social media

For Content Studio and anyone making posts for One Flame Records or Flames Lounge. A label post should look like a record sleeve: cream paper or ink black, a heavy Fraunces headline in oxblood or bone, a small uppercase label, and ochre used once. A Lounge post is the same system after dark.

## Accounts

- **Flames Lounge** posts as **@flamesmobay** on Instagram and TikTok.
- **The label** posts as **@oneflamerecords** on Instagram (`instagram.com/oneflamerecords`) and YouTube (`youtube.com/@oneflamerecords`). Frank confirmed both exist on 2026-10-05.
- The app's own campaign tool posts to Instagram and Facebook through a Make.com webhook (an automation service that receives the post and publishes it). TikTok has no automatic route; it is posted by hand.

## Formats

These are the usual platform sizes, not settings read from Content Studio.

| Use | Size | Notes |
| --- | --- | --- |
| Instagram and Facebook feed | 1080 × 1350 (4:5) | The default. |
| Square post, carousel slide, release cover share | 1080 × 1080 | Release covers are square; keep them square and uncropped. |
| Story, Reel and TikTok cover | 1080 × 1920 (9:16) | Keep text out of roughly the top 250px and bottom 340px, where the app's buttons sit. |
| YouTube thumbnail | 1280 × 720 | Photo or video still, plus one short Fraunces line. |
| Link preview | 1200 × 630 | The site's own sharing card: the formal logo centred on `ink`. |

Leave a margin of at least 64px on every side of a 1080px post for text and the logo.

## Five layouts

Build every post from one of these. They are the website's own sections at social size.

1. **Photo with headline.** A real photo, edge to edge, under `ink` at about 70% with a soft oxblood glow low on the left. Eyebrow in `ochre`, uppercase, widely spaced ("MONTEGO BAY · JAMAICA"). Headline in Fraunces bold, `bone`, at most two lines. A short 1px oxblood rule under it. This is the home hero.
2. **Record sleeve.** `cream` ground. Eyebrow in `forest` ("NEW FROM [ARTIST]" only when the release is confirmed). Headline in Fraunces bold `oxblood`. A short oxblood rule. One line of Inter in `ink`. For release announcements, the square cover sits beside or above it, uncropped, with the type pill (single in ochre, EP in forest, album in oxblood).
3. **Roster card.** An artist's own photo, square, with an `ink` gradient rising from the bottom. Stage name in Fraunces bold `bone`, hometown below in small uppercase `bone` at 55%. Only artists on the roster, named exactly as on their profile.
4. **Oxblood band.** `oxblood` ground, headline in Fraunces bold `bone` ("Sign with One Flame."), one line of `bone`, and a `bone` action block with `ink` text. For the last slide of a carousel and for calls to artists.
5. **Lounge night.** `lounge-night` or `lounge-deep` ground, `ochre` eyebrow, `bone` headline ("Jamaican flavour, made fresh."), copy in `bone` at 55% or more. For food, events and the gaming lounge. Name events only once they are scheduled.

Optional flourish: the flame glyph alone (`icon.png`), small, in a corner of a cream post. Once per post at most.

## Type on images

- Headlines: Fraunces, bold, sentence case, often ending with a full stop. Never all caps, never light.
- Labels: Inter semibold, uppercase, letter-spaced about 0.22em, small. `forest` or `oxblood` on cream; `ochre` or `sage` on dark grounds. Never forest or oxblood text on ink or a dark photo — they cannot be read there.
- Body: Inter regular, one or two short sentences at most. The caption carries the rest.
- Money, times and session lengths, when shown: JetBrains Mono.

## Colour on images

- Most of the frame is cream, ink, the Lounge near-black or the photo. Oxblood carries headlines and the band; forest is a small accent; ochre is one label or one action block. Never an ochre background over a whole post.
- Never set ochre text on cream (2.4:1). Text on ochre is `ink`.
- Pure black and pure white are not brand colours. Use `ink` and `bone`.

## Photos

- Real photos only: the label's artists, its shows and studio sessions, the Lounge, its food. Warm white balance, natural or available light, grain over gloss. Black and white works on dark layouts.
- The one real brand photo today is the night performance in the Imagery group. Artist photos and release covers come from the label's own uploads.
- There are no real photos of the Lounge yet. The stock photo of another bar was taken off the Lounge page on 2026-10-05; never use it or any stock image as the Lounge. Until the owner supplies real photos, Lounge posts use layout 5 with no photo.
- The app can generate images and videos with AI. Never present a generated image as a real artist, a real show or the real Lounge. Generated people must be Jamaican, shown through visible detail and real Jamaican settings, per the label's video rules.
- No tourism postcards: palms, white beaches, cocktails with umbrellas.

## Logo

- Use the files in the Logos group as they are. On a cream post: `logo-2.png` or `logo-4.png` top-left or bottom-left, about 240px wide on a 1080px post; or `logo.png` centred on a closing slide.
- The logo's lettering is oxblood. On ink or a dark photo it reads poorly; use the flame alone (`icon.png`) there, about 80–100px tall, or put the logo on a cream panel.
- Never redraw, recolour, or separate the inner flame.

## Captions

- The back of a record sleeve: confident, grounded, specific. Lead with the real thing — the artist, the track, the night, the food — then one clear next step.
- Link to `https://www.oneflamerecords.com` (or `/flames-lounge` for the Lounge, `/sign` for artists).
- Say "Montego Bay, Jamaica". Never give a street address, opening hours or a phone number; none are published.
- Never quote food, drink or gaming prices. Never promise a release date, a performer or an event that is not confirmed.
- Never repeat the old About page history or "ten million streams": Frank confirmed on 2026-10-05 that they are not true, and they were removed from the site that day. Never claim awards, chart positions or endorsements.
- One history line is true and can be used: production, mixing and video work happen in-house at the label's Montego Bay studio (confirmed by Frank, 2026-10-05).
- No "Vibes only", no ironic "irie", no "soulful", no Patois for flavour.
- Hashtags: the campaign tool asks for three to five per Instagram post and three on TikTok. There is no fixed house set in the code; keep them plain and specific (artist name, genre, Montego Bay).
- No emoji. The public site uses none.

## Content Studio brand kit

The One Flame Records kit as seeded by Content Studio's `scripts/seed-brand-kits.mjs` (at `85c7b57`). The colours and fonts match the app's code exactly, so nothing was corrected. The imagery, dos and don'ts were drafted and still need Frank's review. It matches the fields Content Studio accepts (6-digit hex colours, length limits).

There is no logo in the kit yet. Upload `logo.png` from the Logos group to Content Studio's image library in the One Flame workspace, then add it under `logos` with the IDs that upload returns. This kit is live in Content Studio as version 3 of the One Flame Records style (read back from the database on 2026-10-05 and identical to the seed script).

```json
{
  "palette": {
    "primary": "#8B2A1F",
    "secondary": "#3F5A3A",
    "accent": "#B8893B",
    "background": "#ECE2C8",
    "text": "#1A1612"
  },
  "extraColors": [
    { "name": "Bone", "hex": "#F5EDD8" },
    { "name": "Rose", "hex": "#E0907F" },
    { "name": "Sage", "hex": "#82A57A" }
  ],
  "typography": {
    "headingFont": "Fraunces",
    "bodyFont": "Inter",
    "notes": "Fraunces carries the headline voice; Inter is for everything read at length. Warm, printed feel — never a tech-startup sans stack."
  },
  "logos": [],
  "imagery": {
    "direction": "Warm, filmic and analogue — the palette of aged print rather than a screen. Jamaican light, real rooms, real studios. Grain over gloss.",
    "subjects": [
      "artists in the studio and on stage",
      "physical media and artwork",
      "Jamaican settings"
    ],
    "avoid": [
      "cold blue-grey tech aesthetics",
      "generic gradient backgrounds",
      "AI-obvious plastic skin and hands"
    ]
  },
  "dos": [
    "Name the artist and the release exactly as credited",
    "Use the release date only once it is confirmed",
    "Credit producers and features where they are known"
  ],
  "donts": [
    "Never announce a date, title or feature that is not confirmed",
    "Never invent chart positions, streams or sales figures",
    "Never speak for an artist in the first person"
  ]
}
```
