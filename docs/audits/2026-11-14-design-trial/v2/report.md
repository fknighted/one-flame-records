# Substantial One Flame homepage study — November 14, 2026

Local only, at Frank's explicit request. [Work and acceptance](../../../../../../Delegations/create-a-substantial-local-one-flame-homepage-redesign-while.md). The previous [conservative trial](../report.md) and its images remain historical evidence; this page design replaces that local candidate, not the live website.

## Design intent and choices

Visual thesis: make the homepage read like a One Flame record-label poster, using scale, real music and flat colour to establish hierarchy. Its audience is listeners discovering the label and artists deciding whether to explore it. Primary action: Hear the roster; the named video supplies immediate proof of the music.

I compared a full-photo opening, a large typography-led opening, and an enlarged version of the existing split hero. The typography-led composition makes the largest useful difference using the owner's actual material. Full-photo text overlays would fight the brand rules; another enlarged split would repeat the first trial's conservative choice.

- A black opening carries a paper Pressed in line and much larger yellow Montego Bay lettering. Supporting copy and a wide crop of the existing venue image sit below, replacing the former side-by-side yellow headline/photo blocks. The caption identifies the label and location; no invented place or claim.
- The latest published video has its own red feature band. Its exact title, artist, genuine poster and native playback controls remain. Additional published videos render beneath it when present; zero videos omit the block.
- The nine featured artists become a typographic line-up with their real hometowns when supplied. Every artist link is visible in the document; no carousel, initials or stock portraits. Phones use one column below375px and two above, with deliberately smaller type and shorter rows. Real uploaded photos can still appear as small printed portraits.
- Flames Lounge becomes a yellow title/action panel beside a red list of the four existing offerings: outdoor studio, gaming, Jamaican food and bar. No imaginary Lounge photo, prices, hours or event invented.
- Recruitment closes with a larger black/yellow type composition and the existing approved publishing line. The newsletter, shared navigation and footer are unchanged.

The existing Sound System palette, Big Shoulders/Archivo families, official logo files, square edges, three-tone photo treatment and plain brand voice remain. The homepage-specific scale and layouts live in `src/app/(public)/home.module.css`; no shared brand token or canonical brand-book change is proposed by this local study. Public queries, role/permission logic, forms, prices, release/news content and services are untouched. No dependency, provider, stock asset, effect or animation was added.

## Comparison and assets

The existing comparison at http://127.0.0.1:3197/ now offers Desktop/Phone and New design/First trial. The left panel always shows the original. The working local app is http://127.0.0.1:3196/. These are temporary local processes. [Contact sheet](comparison.jpg); full six-width images and `browser-checks.json` are in this folder.

Original source and fully loaded before captures remain as recorded in the first report. First-trial source was saved locally at `c9bb9789`; its screenshots remain unchanged. New screenshots: desktop1440 ×3529, phone390 ×4092. This study is not a shortest-page contest; the new phone line-up is fully visible without a horizontal gesture.

Only the existing owner venue photograph and the previously extracted genuine Speechless frame are used. The exact source binding and extraction evidence remain in the first report. Video imagery stays unprinted; the venue image uses the existing printed-photo component. No new asset-rights assumptions.

## Verification

- Types and scoped lint passed. No production build or dependency installation was run; checks use the installed Node22 runtime rather than the project's requested24, so this is not release validation.
- Actual rendered widths320,390,768,1280,1440,1920: no broken/missing images or page-wide overflow after loading. Both implementations and all screenshots were visually inspected; the probe itself does not judge visual quality.
- Phone menu open/close and all nine keyboard-accessible artist links checked. The last link was focused visibly at390px (top468, bottom556). The comparison's First trial/New design and Desktop/Phone controls were exercised.
- Review caught and corrected black hover text on the red feature section. Text now stays paper; only the underline changes. Paper/red contrast is5.01:1. Other normal/hover colours reuse existing brand pairs.
- No motion was introduced. Layout reflow was checked down to320px. No actual screen-reader session, full playback test, form submission, production build or measured conversion/performance result is claimed. Unchanged shared controls retain the earlier trial's limits.
- Independent review and the final acceptance state are recorded in the root work record. Design confidence is a visual judgment; Frank's preference and any release decision remain separate.

## Local source boundary

Frank explicitly requested local comparison before publishing. Save the coherent candidate in local Git; do not push the project or trigger Vercel. The earlier trial and original source remain in existing history. No new backup branch, copied project, hosted preview or deployment is needed. Source changes apply only to the local homepage; other routes retain their existing designs.
