# Owner-selected One Flame combination — November 15, 2026

The current local page combines the exact first-trial upper page with the selected poster sections. It is ready for owner review, not publication.

| Part | Exact source |
| --- | --- |
| Hero, latest video placement, artist-card scroller, conditional releases/news | First trial `c9bb9789`, `src/app/(public)/page.tsx` prefix |
| Flames Lounge, Sign with One Flame | Poster `080c4f47`, same page suffix and four required rules from `home.module.css` |
| Stay in the Loop | `src/components/PublicFooter.tsx` and existing `SubscribeForm.tsx`; the saved first/poster/current versions are identical |

The first-trial prefix is byte-identical apart from importing the four poster CSS rules. The Lounge/sign suffix is byte-identical to the poster source. Full Taste is not the base. Public queries, filters, video bindings, artist destinations, remaining conditional blocks, shared footer/form, brand assets and dependencies remain. Earlier candidates remain in Git history and existing comparison artifacts. No skills were loaded or applied; no Taste scripts, installations, upgrades or paid generation were used.

## Affected checks

- Type checking, scoped page lint and whitespace checks passed.
- Actual running homepage captured at 320, 390, 768, 1024 and 1440 pixels. Fonts and all images loaded; document width equals viewport width. Desktop and phone screenshots were visually inspected.
- Actual mobile menu opens/closes and changes expanded state. Keyboard Tab visits all nine artist links and scrolls the native roster. Some focused cards are partly clipped by the intentionally horizontal scroller, as in the first trial; all names remain available through keyboard navigation and All artists.
- The Lounge link opens the local Lounge page; the signing destination opens the local Sign with One Flame page. Newsletter control remains labelled, required and unchanged; no email was entered and no form was submitted.
- Existing player and its source binding are unchanged from the first trial. Prior verified playback evidence is reused; no full playback or customer-delivery test is claimed for this combination.
- Comparison controls retain Original, First trial, Poster redesign and Full Taste screenshots, and add Selected combination as the default candidate, in desktop and phone views.

Local working preview: http://127.0.0.1:3196/. Comparison: http://127.0.0.1:3197/.
Screenshots: `after-1440.jpg`, `after-390.jpg`; combined display `desktop-phone.jpg`. Detailed browser evidence is local in this folder. Separate review is in `independent-review.md`.

No production data/form action, publishing, deployment or GitHub push occurred. Main pushes trigger a live deployment, so GitHub saving remains intentionally withheld under Frank's local-only choice. Local source saving uses existing Git history; no new backup, archive, copied project or backup branch was created. Node22 was available; Node24 release validation and a production build were not run for this cosmetic combination.

Acceptance belongs to `/Users/frankknight/Claude OS/Delegations/combine-one-flame-first-trial-homepage-with-the-selected-pos.md`.
