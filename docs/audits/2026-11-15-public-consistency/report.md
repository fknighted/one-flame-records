# One Flame public-page design alignment — November 15, 2026

The rest of the public site was compared with the approved combined homepage. Most pages already shared the correct fonts, colours, square controls, printed imagery and common header/footer. The local candidate makes the quieter page openings and the old Lounge composition match that homepage more clearly.

## What changed locally

- Artists, releases, videos, news, About and Contact now use one yellow poster opening with larger black headings and the existing content/counts. The new `PublicPageIntro` is scoped to those routes; shared section headings and the published homepage source remain untouched.
- Flames Lounge now opens with the homepage's yellow title/red offerings split. Its existing description, offering names/notes and Instagram link remain. The decorative empty red panel was removed; no venue photo or claim was invented. Lower content, menu, events, links and queries remain.
- `VideoEmbed` uses the existing genuine Speechless still when that exact known upload has no explicit poster. An explicit poster wins. Other uploads and YouTube behavior remain. This covers the video listing and artist/detail uses. A single listed video now has a useful larger width; multiple-video grid behavior remains.
- Subscription confirmation now uses the existing public button classes instead of undefined staff-style classes, with public heading/spacing. Its validation, confirmation action, token, redirect and database call remain unchanged.

Artist/release cards, filters, contact/subscription actions, signing page, search, legal reading, Fola Village and Flames Partner identity were preserved. Staff, portal, till and protected Partner screens keep their separate application design. The approved homepage runtime is not redesigned again.

## What was checked

Before changes, 14 representative public routes were captured and checked at 1440 and 390 pixels: artists, releases, videos, news, About, Contact, Sign, Search, Lounge, Fola, Privacy, Terms, Kahlic and Flames Partner's public landing page. The contact sheet and complete local captures were visually inspected. No horizontal page overflow or unloaded images/fonts appeared.

After changes, the six new openings, Lounge, Kahlic, subscription confirmation and invalid unsubscribe screen were captured at both widths and checked again. The remaining eight artist pages were opened on a phone, plus an intentionally invalid artist-application link and invalid subscription-confirmation state. In total, 25 distinct public paths were rendered, with the additional query states recorded separately. All nine real artist pages fit the phone width; representative detail/source layouts remain consistent.

Actual controls were checked: video-kind filtering selected Lyric and produced its empty result; Clear filters restored the video. Release filtering selected Single and produced its empty result. Search for the public artist name Kahlic returned the expected artist link. The video used the genuine poster, played and advanced past 69 seconds without a reported media error, then was paused. No contact, signing, newsletter, unsubscribe, application or Partner form was submitted.

Type checking, scoped lint, whitespace checks and the complete existing `npm test` suite passed. A separate reviewer checked source, copy/action preservation, types/lint and actual full desktop/phone captures. [Independent review](independent-review.md).

There are no currently published release/news rows to render their detail pages, so those templates were checked in source only. Valid email-confirmation/application tokens, customer delivery, logged-in staff/Partner areas, full accessibility behavior, field performance and a production build were not exercised. No broad security or business-flow certification is claimed. This is a design consistency review.

## Review and saving

[Local before/after review](http://127.0.0.1:3198/) offers eight page comparisons and desktop/phone switches. [Working Lounge](http://127.0.0.1:3196/flames-lounge) and other routes run in the existing local app. Screenshots and raw browser readings remain local in this folder. `after-overview.jpg` shows the updated pages together.

No deployment, GitHub push, customer-data mutation, dependency change, paid generation, tool installation, skill workflow, manual backup, archive or copied project was performed. Main pushes trigger a deployment, so the candidate is saved in local Git only pending publishing approval. Existing approved live design/source and historical comparisons remain preserved.

The sole acceptance record is `/Users/frankknight/Claude OS/Delegations/match-the-remaining-one-flame-public-pages-to-the-approved-h.md`.
