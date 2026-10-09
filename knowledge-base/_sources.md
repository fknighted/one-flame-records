# Sources — One Flame Records knowledge base

Generated 2026-08-11. Everything below was actually read, not assumed.

Update 2026-10-09: all gamer features were removed from the app. `gaming-membership.md` became `gaming-at-flames-lounge.md` (walk-in only, sourced from `src/app/bar/sessions/actions.ts` and `StartSessionForm.tsx`); the old `bar/members/new/actions.ts` source no longer exists.

## Live URLs fetched

- `https://oneflamerecords.com` — redirects 200 to `https://www.oneflamerecords.com/`
- `https://www.oneflamerecords.com/` (homepage)
- `https://www.oneflamerecords.com/about`
- `https://www.oneflamerecords.com/contact`
- `https://www.oneflamerecords.com/sign`
- `https://www.oneflamerecords.com/flames-lounge`
- `https://www.oneflamerecords.com/artists`
- `https://www.oneflamerecords.com/artists/kahlic`
- `https://www.oneflamerecords.com/releases`
- `https://www.oneflamerecords.com/videos`
- `https://www.oneflamerecords.com/news`
- `https://www.oneflamerecords.com/privacy`
- `https://www.oneflamerecords.com/terms`
- `https://www.oneflamerecords.com/search?q=kahlic` (200)
- `https://www.oneflamerecords.com/login` (200)
- `https://www.oneflamerecords.com/sitemap.xml`
- `https://www.oneflamerecords.com/robots.txt`
- `https://www.oneflamerecords.com/news/before-the-drop-inside-the-booth-where-one-flames-sound-is-being-built-1780799887279` — **404**

## Repo paths read

- `Projects/one flame app/CLAUDE.md`
- `Projects/one flame app/README.md` (unmodified Next.js boilerplate — no product content)
- `Projects/one flame app/docs/project-memory.md` (partial; 448 lines)
- `Projects/one flame app/docs/next-session-prompt.md`
- `Projects/one flame app/docs/decisions.md` (tail)
- `Projects/one flame app/docs/brand.md`
- `Projects/one flame app/src/app/(public)/` — route listing, all page directories
- `Projects/one flame app/src/app/(public)/contact/actions.ts`
- `Projects/one flame app/src/app/(public)/signup/[code]/actions.ts` and `page.tsx`
- `Projects/one flame app/src/app/(public)/subscribe/actions.ts`
- `Projects/one flame app/src/app/(public)/unsubscribe/actions.ts`
- `Projects/one flame app/src/app/(public)/flames-lounge/page.tsx`
- `Projects/one flame app/src/app/login/page.tsx`
- `Projects/one flame app/src/app/bar/sessions/actions.ts`
- `Projects/one flame app/src/components/InkShell.tsx`
- `Projects/one flame app/src/components/VideoRequestForm.tsx`
- `Projects/one flame app/supabase/migrations/` — full listing (48 migrations)
- `.../20260513140946_initial_schema.sql`
- `.../20260514000000_cost_limiter.sql`
- `.../20260702000002_game_sessions_pricing.sql`
- `.../20260716000010_gamer_balance_and_signup_throttle.sql`  (historic; gamer features removed 2026-10-09, tables kept)
- `.../20260809000001_money_cents_to_dollars.sql`

## Facts confirmed against live site

| Fact | Value |
|---|---|
| Roster size | 9 artists |
| Published releases | 0 — "Releases coming soon." |
| Published videos | 1 — "Speechless" by Kahlic |
| Published news posts | 0 — "No posts yet" |
| Published email | contact@oneflamerecords.com (Privacy + Terms) |
| Social (label) | @oneflamerecords (Instagram, YouTube) — linked in the site footer; confirmed as the label's by Frank, 2026-10-05 |
| Social (Lounge) | @flamesmobay (Instagram, TikTok) |
| Payments on site | none — no Stripe or any payment provider in the codebase |
| Gaming session rates | J$300 / 30 min, J$600 / 60 min (code constant, not on the site) |
| Submission reply aim | "within two weeks" |
| Policy effective date | June 2026 |

## Repo vs live discrepancies

1. **Sitemap includes an unpublished news post.** `/sitemap.xml` lists
   `before-the-drop-inside-the-booth-...` which returns 404. The sitemap generator does
   not filter on publication state. Recorded in `troubleshooting.md`.
2. **Money migration state is ambiguous.** `docs/next-session-prompt.md` says the
   cents-to-dollars migration is "BUILT, NOT APPLIED" on branch `money/cents-to-dollars`,
   but `main` already carries commit `a537590 refactor: convert all bar money from cents
   to whole JMD dollars`. Internal only — no customer-facing claim depends on it, and the
   knowledge base states amounts as whole Jamaican dollars either way.
3. **Flames Lounge gallery and logo assets are still placeholders** in the repo and read
   "photos coming soon" live. Consistent, and stated as such.

## Deliberately excluded

Admin, bar POS, and label-internal tooling were read for context but are not documented
for the bot: internal routes, staff workflows, database structure, Inngest pipelines,
API keys, environment variables, and the internal fallback admin address hardcoded in
`contact/actions.ts`.

---

# Unresolved questions for Frank

Blunt list. Every one of these is a fact a customer will ask for and the bot currently
has to refuse.

1. **Flames Lounge opening hours.** The live page literally says "Hours coming soon."
   The bot cannot tell anyone when the Lounge is open. This is the single most damaging
   gap for a venue.
2. **Flames Lounge street address.** Only "Montego Bay, Jamaica" is published. No
   directions, no map, no landmark. A visitor cannot find the place from the website.
3. **Phone number / WhatsApp.** None anywhere in the site or the repo. The only reach
   route is a web form and one email address.
4. **Food and drink prices.** Entirely database-driven in the POS (`pos_items`), never
   surfaced publicly. Should the bot be allowed to quote them? If yes, the knowledge base
   needs a synced price list and a refresh cadence, because a stale menu price is worse
   than none.
5. **Accepted payment methods at the Lounge.** Cash only? Card? Mobile money? Not stated
   anywhere.
6. **Gaming session rates — are J$300 / J$600 quotable publicly?** They are hardcoded in
   `src/app/bar/sessions/actions.ts`, not on the site. I have documented them with a
   "confirm at the counter" hedge. Confirm they are current and may be quoted.
7. **Is `contact@oneflamerecords.com` a real, monitored mailbox?** It appears only in the
   Privacy and Terms copy. `RESEND_FROM_EMAIL` and `ADMIN_EMAIL` are separate. If nobody
   reads it, the bot is directing data-deletion requests into a void.
8. **Response time for non-artist enquiries.** Two weeks is published for artist
   submissions only. Nothing for press, sync licensing, private hire or general enquiry.
9. **Private hire** — is it actually bookable today? Any minimum spend, capacity,
   notice period, or deposit? The site offers it with no detail at all.
10. **Events.** The `events` table exists and the page renders live events, but nothing
    is scheduled. Is the programme running? Are open mic nights weekly?
11. **Refund / cancellation policy.** None exists in any form. Probably fine while
    nothing is sold online, but the Lounge takes money in person.
12. **Deal terms for artists.** "You keep your publishing" is the only published term.
    The bot will be asked about splits, length and advances and must refuse every time.
13. **Releases.** Zero published. *Resolved in part 2026-10-05:* the About page no
    longer claims a 2019 debut catalogue or any stream count (see 16).
14. **Streaming platform links.** No Spotify or Apple Music link exists anywhere on the
    site. *2026-10-05:* the About page's "distribution is worldwide" line was removed
    with the timeline; which platforms the label is on is still unconfirmed.
15. **Label social accounts.** *Resolved 2026-10-05:* Frank confirmed `@oneflamerecords`
    on Instagram and YouTube are the label's (already linked in the site footer).
    `@flamesmobay` is the Lounge's.
16. **About-page timeline.** *Resolved 2026-10-05:* Frank confirmed the founding story
    and "ten million combined streams" are not true. The whole timeline (founded 2018,
    first release and radio play 2019, distribution deal 2020, studio expansion, video
    production, roster growth, ten million streams 2024) was removed from the page and
    from this knowledge base. No founding year, release history or stream figure is
    confirmed; the bot must not give one.
