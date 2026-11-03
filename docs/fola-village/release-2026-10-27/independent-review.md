# Fola Village publication — independent review

27 October 2026. Separate reviewer: `codex-fola-review-independent`.

## Release source scope — accepted

Independently flattened the prior deployment's 427-file source inventory and calculated SHA-1 hashes of every isolated release file. All 459 source files match both `expected-source.json` and the CLI dry-run inventory. No prior source path is removed.

Only 35 paths are changed or added: the new Fola page, Fola public brand assets, public header/footer and sitemap. The only existing source files changed are the header, footer and sitemap. Every Fola overlay file matches the previously reviewed project implementation. All other previous serving source hashes remain unchanged, including package/lock files, authentication, enquiry sending, admin/email-studio and database migrations. The three recovered continuity documents match prior serving source hashes.

This accepts the isolated source scope, not publication success. Staged build/source identity and independent live verification are pending.

No deployment, promotion, source implementation, provider setting, database, email, commit or push action was performed by this reviewer.

## User-requested illustration delta — accepted

The first staged deployment is superseded. Frank requested the supplied community/drumming illustration with One Flame typography. Rechecked the updated isolated source: 460 files match `expected-source.json`; 36 allowed Fola paths are changed/added and no prior path is removed. The additional asset is `public/brand/fola-village/community-river.webp` and the page section changes are within scope.

Independent local Chrome checks at 390 and 1440 pixels confirm the illustration loads and layout has no horizontal overflow. The heading uses the native Big Shoulders font and supporting copy uses the established site type. The image is explicitly described as an illustration, adds no factual claims, and does not replace the approved logo or drum-only favicon. Screenshots: `independent-art-390.png`, `independent-art-1440.png`.

Replacement staged deployment under review: `dpl_Gj2YtpaYRpeMvHGAKAEyvF26FAV6`. Live promotion remains pending at this point.

## Final staged identity and live publication — accepted

Independently flattened `final-staged-files.json`: all 460 deployed source hashes equal `expected-source.json`, with no extra or missing source files. Read successful hosted build completion and Ready status. Release identity records production deployment `dpl_Gj2YtpaYRpeMvHGAKAEyvF26FAV6` in the existing One Flame project/team, with prior serving deployment retained as rollback identity.

Independently opened https://www.oneflamerecords.com/fola-village in Chrome at 390 and 1440 pixels. Both return 200, have no horizontal overflow or browser exceptions, and load the approved hero logo and user-requested illustration. Native heading font is Big Shoulders. Phone menu includes Fola Village and closes on selection. The page's contact button reaches the real `/contact` form with General enquiry selected. No form was submitted.

Fola canonical/icons are correct; public favicon, logo, illustration and manifest return 200. Independently compared downloaded favicon SVG, approved stacked logo SVG and source illustration to local reviewed files: exact byte matches. Browser asset URLs contain the final deployment identity. Sitemap returns 200 and includes the public Fola URL. `/about` keeps the One Flame icon; signed-out `/admin` still redirects to `/login?next=%2Fadmin` and shows the sign-in heading.

Screenshots `independent-live-390.png` and `independent-live-1440.png` were captured after the illustration was explicitly scrolled into view to trigger normal lazy loading, then returning to the top. Measurements/navigation results are in `independent-live.json`.

**Publication accepted. Both delegation phases are complete.** This verifies the scoped public release, not signed-in admin operations or enquiry email delivery. No migration, email, commit, push or unrelated security update was performed by this reviewer. Existing content limits about photographs, river name and detailed visitor arrangements remain.
