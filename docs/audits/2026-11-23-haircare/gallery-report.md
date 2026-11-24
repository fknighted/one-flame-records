# Petttrice Hair Care — owner-supplied gallery reference

Frank supplied the exact desired screenshot on November 23 after earlier implementations used the wrong reference. Use the visual title **FIND YOUR NEXT LOOK**, not option numbering. The screenshot is retained locally as `owner-gallery-reference.png`; it matches the original generated gallery study `exec-9712affc-a4b0-47db-b65a-e972b3871a32.png`. This reference supersedes earlier cream editorial interpretations and review claims.

## What now matches

The route has a black ground, simple parent navigation with yellow rule, cream business-name strip, large two-line FIND YOUR / NEXT LOOK headline, right-side offer/action, three-column desktop gallery with four photographs, labels and a cream LET’S PLAN YOUR LOOK contact panel. Braids sit on red at left; two curl photos stack in the center with Natural texture label; the twist updo sits on yellow at right. On phones the side portraits pair in one row and the center curl photos pair below, with correctly associated captions. Exact `/haircare` retains its own header and no shared music newsletter/footer. Other routes' branding exclusion is unchanged from the previous checked revision.

Confirmed offer is adult and kids’ braiding, extensions, washing and blow-drying. Prices start at J$3,000; call to confirm a style's price. Phone links use `tel:+18767822736`. Contact panel includes 5 Creek Street, Montego Bay and address-search directions. The generic mockup paragraph is replaced by these business facts. Generated artwork, font metrics, the added price/contact facts and phone reflow differ from the reference; no pixel-identical claim is made.

## Checks

Node24 typecheck, scoped lint and whitespace check passed. Browser captures `gallery-{width}.png` and `gallery-checks.json` cover 320,390,768,1280,1440,1920 pixels; 640px reflow is also checked. Four images load, no horizontal overflow or browser page errors, call targets correct and keyboard focus visible. Actual screenshots were inspected. A separate read-only reviewer compared the exact owner screenshot with desktop/tablet and live phone output, verified contact-anchor navigation and exact contact link targets, and requested a phone-caption correction. That was fixed with explicit image/label grid placement; recheck is recorded in `gallery-independent-review.md`.

Actual calls, map-pin accuracy, screen-reader use, production build, live deployment and field performance are not certified. No customer message, form submission, account creation, dependency change or publication occurred. The pre-existing moderate framework security findings recorded in the earlier report remain unchanged. Social signup was postponed by Frank; neither social account was created and the page has no invented social link.

## Image assets and prompts

Built-in image generation reconstructed four standalone photos from the original gallery reference. Current project assets are `public/haircare/gallery-braids.webp`, `gallery-natural.webp`, `gallery-curls.webp`, `gallery-twists.webp`. All are visibly identified as illustrative style inspiration. They are not actual work/customer photos. The earlier unused portraits remain preserved; source-saving is not a cleanup request.

Shared prompt: “Extract/reconstruct the specified single illustrative beauty photograph from the reference website mockup. [description below] Output just one high-resolution photo with no website, no text, no borders, no other photos, no watermarks. Portrait aspect ratio for tall left/right; square for center photos. Match the reference composition closely.”

- Braids: “ONLY the tall left photograph: adult Black woman with long medium box braids, turned over bare shoulder looking toward camera, black strap, gold hoop earrings, warm rich skin, flat vivid flame red background. Preserve pose, hairstyle, lighting and crop from the reference gallery's left portrait.”
- Natural: “ONLY the upper center photograph: adult Black woman with voluminous shoulder-length black natural curls, relaxed confident gaze at camera, one hand supporting cheek, black top, flat golden yellow background. Preserve pose, hairstyle, lighting and crop from reference upper middle photo.”
- Curls: “ONLY the lower center photograph: adult Black woman close side/three-quarter portrait with short glossy natural curls, eyes gently closed, head slightly tilted back over shoulder, black top, warm cream background. Preserve pose, hairstyle, lighting and crop from reference lower middle photo.”
- Twists: “ONLY the tall right photograph: adult Black woman with large black rope twists gathered in high updo, a few twists framing face, black ribbed high-neck sleeveless top, gold hoop earrings, head turned slightly looking confidently at camera, flat golden yellow background. Preserve pose, hairstyle, lighting and crop from reference right portrait.”

## Source and release boundary

Scoped local source commit: `fix: use owner-supplied haircare gallery design`. No remote push: owner-controlled public origin has production connected to main and no established safe non-deploying destination. GitHub coverage therefore remains incomplete for this candidate. Local source saving does not authorize release; earlier public-consistency holds remain. The sole root ledger is `build-petttrice-hair-care-at-haircare-using-owner-selected-s`.

## Petttrice-only branding follow-up

Frank requested removing One Flame Records from both hair-care pages. Removed the family-page footer link, changed gallery header/home links to Petttrice, and overrode inherited browser-title and Open Graph site names on both routes. No site-wide metadata or other routes changed. Node24 types/scoped lint and phone/desktop checks cover both routes; no visible One Flame text, inherited title suffix or root links remain. Small reversible content change, with earlier review retained for unchanged layout. Local checkpoint only; no push or publication.
