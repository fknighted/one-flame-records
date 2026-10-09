# Sound System rebrand release — 2026-10-09

Frank approved the Sound System brand on 2026-10-08 and authorized commit, push and go-live on 2026-10-09.

- `681d391` — `design-system/` rewritten as the Sound System (published copy: https://claude.ai/artifact/WJFpQH32qQV2qbiZEyS7WU) and `brand/vector/` logos.
- `8dd1855` — public site rebuilt; admin, artist portal, bar till and gamer portal restyled (calm studio look, `src/app/studio.css`). Behaviour unchanged. Old record-sleeve tokens and Fraunces/Inter/JetBrains removed.
- Vercel production `dpl_DCc614NppGdrhHGhoeRzoAGkkukx` serves both domains. Rollback: `dpl_CcwWUZi6Ezs3jSrC1SPuaKfT15Xr` (807859f). No database, Inngest or credential change.
- Content Studio: One Flame Records default brand kit is now version 4 (Sound System), applied the same day; seed commit `6292341` in content-studio.

Evidence: `docs/audits/2026-10-08-sound-system/` (QA, independent verification, live verification, screenshots).

Not verified: signed-in admin, portal, bar and gamer screens in a browser (checked from code only); the photo print on a real uploaded artist or news photo (none exist yet); placeholder and hover colours.

Open follow-ups: email templates (`src/lib/email/templates/`) still use the old palette; the home roster shows only artists with a featured order set in the admin; `docs/project-memory.md` should link this note once the other session's unsaved edits there are settled.
