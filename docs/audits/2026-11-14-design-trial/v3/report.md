# One Flame — full Taste local trial

The fourth local version uses the installed Taste 2.5.1 toolkit to put the real music video beside the opening headline. A compact artist list sits beside the real performance photograph, followed by four clear Lounge offerings and a wide signing action. The original, first trial and poster redesign remain in the comparison.

This version puts listening and the label's music category ahead of the location-led poster treatment. The poster version still has the stronger place-name statement. This is a visual comparison, not proof of increased listening or sign-ups.

## Actual Taste use

- Upstream `Leonxlnx/taste-skill`, pinned at `f6b76575f949707b4e3c37cd86cb44b0b98643e8`, installed globally in `~/.agents/skills/design-taste-frontend` and shared with Claude.
- Read the skill's layout, copy, system, sections, motion and performance guidance. Used its actual service/film layout deal, film hero template, row-list and close-type recipes as the composition source. See [plan](plan.md), [layout output](taste-layout.json), [brand diagnostic](taste-brand-output.txt) and [license](LICENSE-TASTE.txt).
- Ran original `copy-lint.mjs`, `consistency.mjs`, `perf.mjs` and `shoot.mjs`; raw results accompany this report. The consistency pass used `--quick` at 1440 and 390 pixels; it did not run the full slow, motion-failure or hidden-tab suite. No vendor files were changed. No global hook was installed or disabled and no green gate was manufactured.
- Kept the existing fonts, exact palette, square controls, genuine logo and approved wording. The brand diagnostic's example font was not adopted. No forced screen-height grid, gratuitous animation, generated venue image or replacement design system was introduced. This follows the maintained Taste adaptation in Claude OS.

## Checks and findings

Types, scoped source lint and whitespace checks passed. The actual running page had no horizontal overflow, broken images or unloaded fonts at 320, 390, 768, 1024, 1280, 1440 and 1920 pixels. All nine artist links remain native links with the same destinations. The mobile menu opened and closed with its expanded state changing. Video playback advanced beyond ten seconds, with a ready player and no media error, then was paused. Comparison controls switched among all three candidates and desktop/phone images correctly.

Taste's copy lint exited cleanly; it reported only informational observations about existing approved copy. Taste's consistency check does **not** pass its native house rules. Findings include mandatory full-screen sections, exact container/split lines, a maximum of three background colours, text under photographs, visual requirements in the Lounge, different button treatments and absent entrance animations. Those rules do not override the requested One Flame brand. Its claim that “Hear” is not a verb is a checker vocabulary limitation. Its small footer alignment finding is in the unchanged shared footer; it is not concealed as a passed check.

The consistency checker was run on a script-free public-page snapshot, with the subscription form disconnected. This prevented its automated form submissions from reaching the real business. Consequently its mobile menu failure is a snapshot limitation; the actual Next page's menu was tested separately and worked. Forms and business delivery are not verified by this design exercise. Fonts are embedded in the final diagnostic snapshot to avoid false cross-origin font failures. Browser-injected controls were removed from that diagnostic snapshot.

Taste's performance tool measured the actual Next development server, with three loads each at desktop and phone sizes. It failed its JavaScript size budget and flagged a video request; it also warned about transfer size, a fill-positioned image without literal dimensions and the reused eager logo. Actual video playback worked separately. Font/image budgets and zero measured layout shift passed. Host load was busy, so timing results are limited. These are **development diagnostics**, not production performance certification or field measurements; a production build was not run for this local design trial. Node 22.22.3 was available; the project's Node 24 release environment was not validated.

## Boundaries and evidence

The public queries and filters, conditional releases/news, routes, native player, business forms, packages and shared brand system remain. No customer data was written and nothing was deployed or pushed. Prior designs remain in local source history and frozen comparison screenshots.

Screenshots: `after-1440.jpg`, `after-390.jpg` and five other widths. `comparison.jpg` shows all four versions; `comparison-browser.jpg` shows the interactive review page. The original full Taste reports are diagnostics, not an approval. Independent review is recorded separately in `independent-review.md`.

The owning acceptance record is `/Users/frankknight/Claude OS/Delegations/build-and-compare-a-local-one-flame-version-using-the-full-i.md`.
