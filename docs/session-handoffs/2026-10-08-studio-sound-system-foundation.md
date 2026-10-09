# Studio Sound System foundation — October 8, 2026

Dispatched implementer, studio foundation chunk of `/Users/frankknight/Claude OS/Delegations/restyle-the-one-flame-admin-and-studio-screens-to-the-sound.md`. Nothing committed, pushed or deployed. No database access. No build or dev server run (parallel agents were editing public pages).

## What changed

- New `src/app/studio.css`: plain CSS in the `components` layer on the `globals.css` variables (with fallbacks). Classes for the shell ground, page title, section title, labels, money, counts, links, cards, stat tiles, tables, fields, buttons (primary, secondary, danger, quiet, small), status chips, error/success strips and the empty state. Passed through `@tailwindcss/postcss` unchanged (checked offline).
- `src/components/InkShell.tsx`: black ground, panel sidebar, line borders, Archivo, `LogoMark` (light horizontal and flame) instead of the PNG logos, 44px nav rows with a paper left edge for the current page plus `aria-current`, square paper count badge, no backdrop blur. Props, nav items and open/close behaviour unchanged.
- `src/components/LogoutButton.tsx`: small secondary button. `src/components/ToastProvider.tsx`: square green/red strips with paper text, no shadow.
- `src/app/{admin,portal,bar,gamer}/layout.tsx`: import `@/app/studio.css` (one line each).
- `src/app/login/page.tsx`, `src/app/auth/{callback,portal-invite,set-password}/page.tsx`: black ground, paper fields, yellow primary button, red error strip, studio type. Logic untouched.
- New `docs/studio-sound-system.md`: mapping table, contrast figures, snippets for the page agents.

## Checks run

- `npx tsc --noEmit`: exit 0, no output.
- `npx eslint` on all touched files: 0 errors, 11 warnings, all `no-location-assign-relative-destination` on the deliberate `window.location.href` sign-in redirects; the same 11 are in the pre-change baseline.
- Contrast script (scratchpad `studio_contrast.py`): every text pair used is 4.5:1 or more; edges 3:1 or more.

## Not verified

- Nothing was looked at in a browser. The only running server (port 3107) is `next start` on an older build, so it serves the old login page.
- Studio pages still carry `bone`/`ochre`/`ink` classes until the page agents run, so they will look mixed (old ochre and bone on the new black shell).

## Status file

`docs/project-memory.md` already carries another session's uncommitted changes and was not edited. Add this handoff to it when those changes are settled.
