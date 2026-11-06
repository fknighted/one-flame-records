# Full legacy studio removal — October 8, 2026

Frank authorized removing every legacy studio entry point, then committing, pushing and deploying. The admin AI Studio section, image/copy tools, campaign tools, production job pages, related actions and all generation workers are removed. Contextual AI buttons and generation budget/brand controls are gone. Old video request URLs redirect to saved-video libraries. Those libraries show completed videos only.

Catalog editing, ordinary uploads, songs, saved videos, visibility controls and YouTube uploads remain. Stored media, database rows, applied migrations and actual credentials were not deleted. No separate music-making interface was found; the physical recording-studio business offering remains.

Independent source review confirmed phase 1. Offline retirement checks, type checking and production build passed. Changed-file lint has no errors and three existing image warnings. The earlier full lint check had seven existing errors in unrelated code. The previous live security package versions are retained in this release.

Evidence: [source review](../audits/2026-10-08-total-studio-removal/independent-source-review.md), [build](../audits/2026-10-08-total-studio-removal/build.log), [changed-file lint](../audits/2026-10-08-total-studio-removal/changed-files-lint.log).

Current work and release verification belongs in `/Users/frankknight/Claude OS/Delegations/remove-all-remaining-one-flame-studio-navigation-and-tools-a.md`. Deployment evidence will be appended after the release. This record supersedes the narrower earlier local-removal scope.

Rollback candidate: the previously serving deployment dpl_BM8C1XY7GTeB8ybot9jrry9Gtdfs. Restoring it also restores the legacy tools; no database rollback is needed by this removal.

## Production release

Removal commit `807859f2698e1318ad7926ae1a5dcdc1ca746210` was pushed to `fknighted/one-flame-records` main. Git-integrated Vercel deployment `dpl_CcwWUZi6Ezs3jSrC1SPuaKfT15Xr` is Ready and serving both production domains; its Git metadata matches that commit. Hosted build completed successfully. No unrelated mix exports or credential files were staged.

The signed-in admin menu has no AI Studio section, production job links, generation buttons or budget widget. Authenticated `/admin/ai-studio`, `/admin/campaigns` and `/admin/jobs` show404. Existing catalog video remains available with Watch and YouTube controls. Public homepage/artists/releases/videos/login return200; signed-out admin/portal requests redirect to login and unauthenticated worker endpoint rejects access.

The exact One Flame production Inngest app was manually resynced successfully October8 at8:05:07PM Jamaica time against `https://www.oneflamerecords.com/api/inngest`. Its registered functions now contain only hello-world, upload-to-youtube and the YouTube failure handler. No legacy generation functions remain registered. No generation event, media deletion or external publication was performed during verification.

Independent live review is recorded separately. Saved artist-media playback and an actual YouTube upload were not exercised; saved rows/media were preserved. Provider credential values/settings were not changed.

Screenshots: [admin menu](../audits/2026-10-08-total-studio-removal/live-admin-menu.jpg), [worker registration](../audits/2026-10-08-total-studio-removal/live-worker-registration.jpg). These release-evidence updates are saved locally after the source commit.
