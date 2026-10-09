# Sound System foundation (public site) — October 8, 2026

Dispatched implementer, foundation chunk of `/Users/frankknight/Claude OS/Delegations/rebuild-the-one-flame-public-site-to-the-sound-system-design.md`. Nothing committed, pushed or deployed. No database access beyond the read-only public page loads of a local dev server.

## What changed

- `src/app/globals.css`: Sound System colours and fonts added to `@theme inline` beside the old tokens (all kept). Type-style, section-bar, grille, three-tone print and focus-ring utilities added. `body` rule unchanged so studio screens and login are untouched.
- `src/app/layout.tsx`: Big Shoulders (opsz axis, Display cut via `font-variation-settings`) and Archivo loaded. Fraunces, Inter and JetBrains Mono stay loaded **temporarily** for the studio screens.
- `src/app/(public)/layout.tsx`: black ground, grain removed, `<PrintFilters />` mounted.
- Restyled with identical props: `PublicHeader`, `PublicFooter`, `SectionHeader`, `SubscribeForm`, `ArtistCard` (new optional `index`), `ReleaseCard`, `VideoEmbed`, `ReleasesFilter`, `VideosFilter`, `ContactForm`, `SignupForm`.
- New: `src/lib/sound-system.ts`, `Button`, `LinkButton`, `LogoMark`, `SpeakerRings`, `CornerBlock`, `GrilleBand`, `PosterHeadline`, `ArtistInitialTile`, `EmptyState`, `PrintFilters`, `PrintedPhoto`.
- `public/brand/`: copies of the four flame files and the trimmed horizontal and stacked files (originals in `brand/vector/` untouched).
- Usage guide for the page agents: `docs/sound-system-foundation.md`.

## Checks run

- `npm run typecheck`: passed, no output.
- `npm run lint`: 34 problems (7 errors, 27 warnings), identical file list to the pre-change baseline.
- `npm run build`: exit 0, 73 of 73 static pages generated. A first build warned that Big Shoulders had no fallback metrics; fixed with an explicit fallback, and the second build had no warnings besides Sentry deprecation notices.
- Local dev server: home, artists, releases, videos, news, about, contact, sign, flames-lounge and gamer-signup returned 200 with the filters and light logo in the HTML. Server stopped afterwards.

## Not verified

- No screenshots; nothing was looked at in a browser, at 375px or otherwise. The three-tone print has not been compared to the concept or checked in iPhone Safari.
- Page files were not touched, so pages still carry cream/ink/oxblood classes and will look mixed until the page agents run. Sections that set `bg-cream` now hold paper-text `SectionHeader`s and `VideoEmbed` captions, which are unreadable there until rebuilt.

## Status file

`docs/project-memory.md` was already modified by another session and was not edited here. Add this handoff to it when that session's changes are settled.
