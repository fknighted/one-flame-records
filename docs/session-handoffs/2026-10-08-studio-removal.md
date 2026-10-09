# One Flame old video studio removal — October 8, 2026

## Result and scope

Frank authorized beginning code removal after the October 7 plan. The local app no longer contains the old artist/admin music-video generation stack or campaign video renderer. Finished videos, source songs, catalog management, uploads, visibility controls and the shared YouTube uploader remain in the code. The image/copy/campaign tools remain, including video script preparation. No separate music-making studio was identified in this repository; removing the physical recording studio offering was not inferred.

[Current work and review state](/Users/frankknight/Claude OS/Delegations/remove-the-old-one-flame-video-production-code-while-preserv.md)

## Changed behavior

- Artist/admin request pages redirect to saved-video libraries; old form actions, retries and per-clip regeneration are removed.
- Artist and campaign video workers are removed from source and worker registration. All old creation-event emitters are removed, including automatic campaign generation/regeneration follow-up and the manual generate-from-script button.
- Legacy generated-mode campaign events now prepare scripts only. Offline tests cover video posts, reels and stories, preserving captions/scripts while forbidding video events.
- Video provider adapters, scene planning, audio analysis/transcription, FFmpeg assembly, studio budget and intro/outro controls are removed. Historical clip result types remain for archive rendering.
- Saved job history retains recorded statuses, outputs, cost records and appropriate visibility/YouTube controls. History pages no longer imply active rendering or poll automatically. Cancel/reset actions remain solely for retirement operations on unfinished old jobs; they cannot create jobs.
- FFmpeg and Higgsfield-only dependencies are removed. Retained direct dependency versions and all retained locked package versions match the pre-task source snapshot. music-metadata stays for asset uploads; OpenAI/Anthropic/Inngest/googleapis stay for shared image/copy/script/YouTube services.
- Provider placeholders were removed only from .env.example; no actual environment/credential files or hosted settings changed.
- CLAUDE.md and architecture/pipeline/status records now distinguish local removal from the unchanged hosted release. Historical decisions and applied migrations remain intact.

## Checks actually performed

| Check | Result |
|---|---|
| node scripts/test-studio-retirement.mjs | Passed; all services mocked, no credentials/media read |
| npm run typecheck | Passed on final code; also independently run by reviewer |
| npm run build | Passed on final code; [output](../audits/2026-10-08-studio-removal/build.log) |
| Changed-source lint | Passed, no findings; [output](../audits/2026-10-08-studio-removal/changed-files-lint.log) |
| Full lint | Failed on seven existing errors and 28 warnings in unrelated files; [output](../audits/2026-10-08-studio-removal/full-lint.log) |
| Production-only dependency audit | No reported findings; [evidence](../audits/2026-10-08-studio-removal/production-dependencies.json) |
| git diff --check | Passed after whitespace repair |
| Separate source review | No remaining actionable findings; [review](../audits/2026-10-08-studio-removal/independent-review.md) |
| Preservation scan | No edits to public/catalog video pages, ordinary video upload actions, portal audio uploads, YouTube worker, database types/migrations, bar or route protection |

The independent reviewer found an initial script-normalization regression (the check used a nonexistent video content type). The implementer fixed it and the reviewer independently reran the executable mocked workflow checks. The final review also confirmed the archive status wording and absence of pulsing indicators.

React and web-interface source checklists were applied to the changed interface, using the retrieved October 8 guidelines. No redesigned interface or authenticated browser acceptance is claimed.

## Preservation and limits

Pre-existing reviewed security changes in package files/status documents, security receipts and mix-exports were preserved. The active ACE-Step chat was inspected before writing: its installation and file edits were outside this app, under /Users/frankknight/Music/ACE-Step-1.5. Research was sequential; only separate read-only code review used an agent.

No commit, push, deployment, database migration/deletion, media deletion, credential change, social posting, paid generation or provider-account change was performed. The build uses the existing environment and may read public database data during static generation. Live worker registrations, pending/running jobs and authenticated saved-media playback were not checked. Local code removal does not stop workers in the currently serving release or cancel an already-running hosted job.

Before any later release, the operator must assess the old hosted queue/workers and preserve existing media. Release authorization and operational continuation belong in the linked ledger. No new campaign-studio URL, provider or One Flame workspace integration was added.

## Recovery

Tracked source can be recovered through Git. Temporary source-only pre-edit copies are at /tmp/one-flame-studio-removal-2026-10-08; this is not a durable media/database backup. No stored data was changed, so no data restoration is required by this local change.
