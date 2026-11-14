# One Flame homepage design trial — November 14, 2026

Local candidate, independently reviewed; not published. Frank asked to try the updated design skills on an existing site. [Current work and acceptance](../../../../../Delegations/try-updated-design-skills-on-the-one-flame-homepage-with-a-l.md).

## Result

The published Speechless video by Kahlic now follows the existing hero, before the roster. A still extracted at 10 seconds from the exact public upload supplies its poster (1280 × 720, 88,688 bytes). The file is `public/speechless-kahlic-poster.jpg`; the homepage binds it only to the existing storage filename `ac45c5ce-9554-45cc-9c4f-cbe756dd47cb.mp4`. A new upload requires a new reviewed poster. This is an authentic video frame, not a stock image or a photograph claiming to show the artist. Videos remain unprinted, as before.

The nine existing featured artists now occupy one native horizontal browsing row. Original square tiles, colours, initial fallback, order and links remain. The region has an accessible name, instructions, visible focus and keyboard access; All artists remains available as an alternative. The full catalogue and every query are unchanged.

A single video gets an editorial title/artist beside it. Multiple videos retain the responsive grid and individual captions. Optional player props default to the original caption behavior everywhere else. No new dependencies, visual libraries, motion, typography, account or hosting change.

This applies the updated skill's product-proof and purposeful-composition ideas. It is one design example, not a controlled comparison between two skill versions or evidence of increased listening/sign-ups.

## Comparison

Open `index.html` through a local server for Desktop and Phone modes. Browser views during this session: comparison at http://127.0.0.1:3197/ and current app at http://127.0.0.1:3196/. These are temporary local processes, not hosted URLs. Durable screenshots and [the contact sheet](comparison.jpg) remain in this folder.

Baseline homepage source: `3b2df82fe225ca6df5ba0497930e40eb549073d8`. A temporary local route rendered that exact Git source for corrected captures, then was removed. Both baseline images were recaptured with loaded hero/footer images. Source context uses the same public catalogue; no fictional customers, artists or media were inserted. The hero, shared header/footer and public copy are unchanged. Before desktop is 1440 × 3701; after is 1440 × 3107. Phone is 390 × 3840 before, 390 × 3285 after.

## Checks actually run

- Type checking and scoped lint passed, independently repeated by `/root/review_one_flame_trial`.
- Actual browser widths: 320, 390, 768, 1280, 1440 and 1920. The updated probe returned no failed or missing images and no page-wide horizontal overflow after lazy assets were loaded. See `browser-checks.json`. Candidate elements inside the intentionally scrollable roster are not page overflow.
- All six after screenshots were inspected independently; desktop and phone composition, type, crop and image loading were checked. Early captures with displaced sticky headers/scroll positions were replaced with clean top-of-page captures.
- Keyboard Tab reaches all nine artist links and reveals the final card inside the region (390px: final link bounds 199–374px). Phone menu opens and closes with the correct expanded state.
- Native video controls, accessible title and loaded media were observed; no autoplay added. Full playback was not tested. Forms were not submitted.
- Source review confirmed the zero/multiple-video branches, original player defaults and untouched data/permissions logic. No production build or actual screen-reader test was run; performance and live listening/signup outcomes are unverified.
- Checks used installed Node 22.22.3, rather than the project's requested Node 24. No runtime installation or dependency upgrade was made; this is not release validation.
- Fresh Vercel interface guidelines were consulted on November 14 for the focused source audit, with local brand/host adaptations. Existing styling and native keyboard controls were retained.

## Skill compatibility repair

The first actual probe run in Codex's read-only browser scope failed because that scope exposes image elements without the global HTMLImageElement constructor. The narrow fix checks the element tag instead. The root skill source, generated mirror and installed copy match. Three real-Chrome tests pass, including a regression with the constructor unavailable; independent review confirmed them. Actual evaluation on this site then passed at all six widths. The helper remains a limited defect probe, not accessibility or design certification.

## Review and source saving

Independent read-only review: CONFIRMED by `/root/review_one_flame_trial`, including corrected baseline evidence, source, screenshots, types/lint and helper tests. No source was deployed. Main-branch pushes trigger Vercel deployment, so the project checkpoint remains local; a source-only remote destination has not been established for this trial. This is the concrete GitHub saving gap, not permission to publish. Root skill maintenance and its ledger are saved through the existing non-deploying OS repository.
