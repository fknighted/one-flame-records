# One Flame Records design system

The One Flame Records brand, written down so people and coding agents build and post consistently. The code is the final authority: if this folder and the code disagree, the code wins and this folder should be updated.

- Live, browsable version: https://claude.ai/artifact/WJFpQH32qQV2qbiZEyS7WU
- Synced from: `concept DRRtVLep9ki5pNCDPV3Mo5 v8 (Sound System), repo main@807859f`

| File | Use it for |
| --- | --- |
| [`brand-book.md`](brand-book.md) | Start here. Voice and copy rules, colour, type, layout, imagery, logo and controls. |
| [`tokens.md`](tokens.md) | Every colour, type style, spacing, radius, shadow and layout token with its value and where to use it. |
| [`tokens.json`](tokens.json) | The same tokens, machine-readable (for scripts, Content Studio and tooling). |
| [`building.md`](building.md) | For anyone changing this code: which components to reuse and how each token is written here. |
| [`social.md`](social.md) | Social media formats, layouts, captions, hashtags and the Content Studio brand kit. |
| [`content-studio-kit.json`](content-studio-kit.json) | The Content Studio brand kit(s) as JSON. |
| [`assets.md`](assets.md) | Logos and imagery: which file to use where. |

Search tips: token names are in backticks (for example `grep -rn "surface-" design-system/`); every hex value appears in `tokens.md`.

To change the system, edit these files and the claude.ai version together, in the same change.
