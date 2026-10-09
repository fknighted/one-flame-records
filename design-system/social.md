# Social media

For Content Studio and anyone making posts for One Flame Records or Flames Lounge. A post is a Sound System flyer at phone size: one stacked headline in Big Shoulders, a flat block of colour, the flame, and nothing that blurs. Lettering and colour do the work, so a post looks finished with no photo at all.

The live site and the live Content Studio kit are still on the old record-sleeve look. Switch posts to this look when the rebuilt site goes live, so posts and site match.

## Accounts

- **The label** posts as **@oneflamerecords** on Instagram (`instagram.com/oneflamerecords`) and YouTube (`youtube.com/@oneflamerecords`). Frank confirmed both exist on 2026-10-05.
- **Flames Lounge** posts as **@flamesmobay** on Instagram and TikTok.
- Posts go out through Content Studio. Nothing here schedules or publishes anything.

## Formats

| Use | Size | Notes |
| --- | --- | --- |
| Instagram and Facebook feed | 1080 × 1350 (4:5) | The default. |
| Story, Reel and TikTok cover | 1080 × 1920 (9:16) | Keep text out of the top 250px and bottom 340px, where the app's buttons sit. |
| Square post, carousel slide, release cover share | 1080 × 1080 | Release covers stay square and uncropped. |
| YouTube thumbnail | 1280 × 720 | A printed photo or still, plus one short headline. |

Leave at least 64px clear on every side of a 1080px post for text and the logo.

## Layouts

Build every post from one of these. They are the website's own blocks at post size.

1. **Yellow poster.** `yellow` ground, the headline in `poster` `black`, stacked one word per line ("Pressed / in / Mo'Bay."). A line of `lead` and the site address bottom-left, the flame in dark speaker rings bottom-right. For the label's main messages.
2. **Photo with a box.** A real photo printed in three tones over yellow (or red), edge to edge. The headline in `poster` `yellow` inside a `black` box at the top-left, the corner block (black, light flame) top-right, one line in a black box at the bottom. Text never sits straight on the photo. For artists and calls to sign.
3. **Red story.** `red` ground, a speaker-grille band across the top, the headline in `headline` `paper` below the safe zone, a short `paper` line and a `yellow` action strip with `black` text ("@flamesmobay"). For the Lounge.
4. **Black wall.** `black` ground, the headline in `paper` with one word in `yellow`, the light flame. For announcements without a photo.
5. **Release poster.** `paper` ground, a `red` band with the release type ("Single"), the cover art square and uncropped, the title in `headline` `black` and the artist under it. Only for confirmed releases.

Real samples from the concept: "Pressed in Mo'Bay. Independent reggae and dancehall. oneflamerecords.com" (yellow poster); "Sign with us. We sign artists, not sounds." (photo with a box); "Flames Lounge tonight? Walk-in welcome. No reservation needed. @flamesmobay" (red story). A real Lounge night only goes out once it is confirmed.

## Type on posts

- **One headline per post, five words or fewer**, in Big Shoulders Display, 900, uppercase, tight leading. Longer lines drop to the `title` size.
- **"Mo'Bay"** is fine in a headline. Supporting text says Montego Bay.
- Supporting lines in Archivo 600, sentence case, one or two short sentences. The caption carries the rest.
- Capitals in Archivo only for short `label` tags and action strips.

## Colour on posts

- Grounds are `yellow`, `black`, `red` or `paper`. One block colour leads each post.
- Text on `yellow` is `black`. Text on `red` and `black` is `paper` (or `yellow` on black). `red` or `black` text on the other only at 24px and up.
- `green` is a small mark at most ("Live", "Open"). Never a ground, never a photo tone, and never in equal stripes with red and yellow: that reads as a tourist flag.
- No gradients, glows, soft shadows or rounded panels.

## Photos

- Real photos only: the label's artists, its shows and studio sessions, its own spaces. Every photo is printed in three tones: `black` shadows, the block colour in the middle, white (`paper`) highlights, at the middle strength. Never green.
- The speaker grille runs beside a photo or across the top of a story, never over the picture.
- There are no real photos of the Lounge yet. Until the owner supplies them, Lounge posts are colour and type only (layout 3 or 4). Never use a stock or AI image as the Lounge.
- Content Studio can generate images with AI. Never present a generated image as a real artist, a real show or the real Lounge. Generated people must be Jamaican, shown through visible detail and real Jamaican settings, per the label's video rules.
- No tourism postcards: palms, white beaches, cocktails with umbrellas.

## Logo

- Original flame (`flame-original.svg`) on `yellow` or `paper`. Light flame (`flame-light.svg`) on `black` or `red`. Never the original on black or red.
- On a photo: the light flame in the dark see-through circle, inside dark speaker rings, or in a black corner block. Never a solid circle.
- Speaker rings for hero posts (about 118 to 132px around the flame on a 1080px post). Corner block (about 78px) for photos in grids and carousels.
- Never redraw, recolour, stretch, or separate the inner flame.

## Captions

- Confident, grounded, specific. Lead with the real thing (the artist, the track, the night, the food), then one clear next step.
- Link to `https://www.oneflamerecords.com` (or `/flames-lounge` for the Lounge, `/sign` for artists).
- Say "Montego Bay, Jamaica" in captions. Never give a street address, opening hours or a phone number; none are published.
- Never quote food, drink or gaming prices. Never promise a release date, a performer or an event that is not confirmed.
- Never repeat the old About page history, the distribution deal or "ten million streams": Frank confirmed on 2026-10-05 that they are not true. Never claim awards, chart positions or endorsements.
- One history line is true and can be used: production, mixing and video work happen in-house at the label's Montego Bay studio (confirmed by Frank, 2026-10-05).
- No "Vibes only", no ironic "irie", no "soulful", no Patois for flavour beyond "Mo'Bay".
- Hashtags: three to five per Instagram post, three on TikTok. Keep them plain and specific (artist name, genre, Montego Bay).
- No emoji.

## Content Studio brand kit

The Sound System kit for the One Flame Records workspace. It replaces the record-sleeve kit (version 3 of the One Flame Records style, live since 2026-10-05) when the rebuilt site goes live. It has not been saved to Content Studio.

It was checked against Content Studio's own `brandKitSchema` (`src/application/brand-kit.ts`) by running that schema file on this exact block: it passes.

There is no logo in the kit yet. Upload `flame-original.svg` and `flame-light.svg` from the Logos group to Content Studio's image library in the One Flame workspace (or PNG copies, if the library does not take SVG), then add them under `logos` with the IDs the upload returns. `carousel` is left out, so slides keep Content Studio's default (headline over the artwork).

```json
{
  "palette": {
    "primary": "#F2C230",
    "secondary": "#C8321F",
    "accent": "#2F6B3A",
    "background": "#0F0D0B",
    "text": "#FFF7E6"
  },
  "extraColors": [
    { "name": "Paper (reading ground, white of photos)", "hex": "#FFF7E6" },
    { "name": "Muted text on black", "hex": "#D8CCB4" },
    { "name": "Logo oxblood (logo only, never recolour)", "hex": "#902721" },
    { "name": "Logo olive inner flame (logo only)", "hex": "#3A482F" }
  ],
  "typography": {
    "headingFont": "Big Shoulders Display",
    "bodyFont": "Archivo",
    "notes": "Headlines in Big Shoulders Display 900, uppercase, stacked tight, five words or fewer; longer text drops a size. Archivo for everything read, sentence case. Text on yellow is black; on black or red it is paper. Green is a small status mark only."
  },
  "logos": [],
  "imagery": {
    "direction": "A Montego Bay sound-system dance flyer: flat solid blocks of poster yellow, flame red and black with hard square edges. Real photos printed in three tones: black shadows, the block colour in the middle tones, bright white highlights, medium strength. The one pattern is a speaker grille of big round holes, as a band beside a photo, never over it. Lettering and colour first.",
    "subjects": [
      "artists in the studio and on stage",
      "live sound-system nights and crowds",
      "the label's own studio and spaces",
      "Jamaican settings in Montego Bay"
    ],
    "avoid": [
      "gradients, glows, soft shadows or blur",
      "rounded cards or panels",
      "a solid circle behind the logo",
      "red, yellow and green flag stripes",
      "photos tinted green",
      "pattern over a photo or behind text",
      "tourism postcards: palms, beaches, umbrella cocktails",
      "AI-obvious plastic skin and hands"
    ]
  },
  "dos": [
    "One headline per post, five words or fewer",
    "Name the artist and the release exactly as credited",
    "Use a release date, event or line-up only once it is confirmed",
    "Put the original logo on yellow or paper, the light logo on black or red",
    "Say Montego Bay in body text; Mo'Bay only in a headline",
    "Credit producers and features where they are known"
  ],
  "donts": [
    "Never announce a date, title, feature or event that is not confirmed",
    "Never invent chart positions, streams, sales figures or awards",
    "Never repeat the removed founding story, distribution deal or stream count",
    "Never speak for an artist in the first person",
    "Never quote food, drink or gaming prices",
    "Never use emoji",
    "Never present a stock or generated image as a real artist, show or the Lounge"
  ]
}
```
