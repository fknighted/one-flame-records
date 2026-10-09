# One Flame Records vector logos

Twelve flat SVGs traced directly from the supplied PNG transparency edges. All lettering is outlined: no fonts, embedded images, or background shapes. The flame gap and letter counters are transparent in every colourway. Do not stretch the artwork.

| Use | Original, on light backgrounds | Light, on dark backgrounds | One colour paper, on dark backgrounds | One colour black, on light backgrounds |
| --- | --- | --- | --- | --- |
| Flame mark: avatars, icons, small brand signatures; full bottom tip | `flame-original.svg` | `flame-light.svg` | `flame-paper.svg` | `flame-black.svg` |
| Horizontal: headers, banners, wide label signatures | `horizontal-original.svg` | `horizontal-light.svg` | `horizontal-paper.svg` | `horizontal-black.svg` |
| Stacked: formal signatures, covers, posters; includes location line | `stacked-original.svg` | `stacked-light.svg` | `stacked-paper.svg` | `stacked-black.svg` |

Original: outer flame and lettering **#902721**, inner flame **#3A482F**. Light: outer flame and lettering **#FFF7E6**, inner flame **#F2C230**. Paper: both **#FFF7E6**. Black: both **#0F0D0B**.

The horizontal and stacked SVGs keep their original PNG canvases and exact placement. The standalone flame is cropped from `public/logo.png`, with 8 pixels of padding around its visible bounds; it does not use the cropped favicon. Its source crop is `(344, 92)–(723, 740)` on the 1080px source. The horizontal trace uses `public/logo-2.png`; the stacked trace uses `public/logo.png`. No font substitution or manual redrawing was used. Only the isolated scanning dot above FLAME was removed from the horizontal artwork.

## Checks and comparison images

All three traces passed the requested **1 pixel maximum boundary difference at 2560px canvas width**. The standalone flame was also checked at its own cropped width of 2560px (4377px tall). Colours do not alter geometry: all four versions of each logo contain identical paths.

Measurement method: scale the PNG alpha channel with bilinear interpolation, trace its 50% opacity contour, simplify with a 0.12px tolerance at comparison size, and render the actual SVG with Sharp's SVG renderer. Compare both silhouette boundaries using the largest nearest-boundary pixel distance in either direction. All three measured **1.0px**. This checks outlines and transparent counters, not a colour match to the textured PNG. Source hashes, dimensions, agreement percentages, and results are in `comparisons/measurements.json`.

For each of `flame`, `horizontal`, and `stacked`, the comparison folder contains:

- `<name>-source-2560.png`: PNG reference at 2560px wide. The horizontal source retains the scanning dot.
- `<name>-svg-2560.png`: rendered original-colour SVG, transparent.
- `<name>-artwork-overlay-2560.png`: source and SVG blended equally on paper. Flat colour differs intentionally from the printed texture. The horizontal scanning dot remains faintly visible from the source layer.
- `<name>-edge-overlay-2560.png`: aligned silhouette check. Paper shows overlap; magenta shows source-only pixels; cyan shows SVG-only pixels. Dark ink is the comparison background, not a fill in the SVG. The intentional dot removal is excluded from this boundary check.

`preview.png` shows all twelve colourways. Open the full-resolution comparisons at 100% to inspect edges.

## Texture and light references

The RGB speckle texture is omitted from these flat versions. Source transparency contours, including tiny edge irregularities, are retained for faithful shape matching. No invented texture overlay is supplied. Faithful reproduction of the original multicolour speckles would require a separate, much larger vector treatment; these flat files do not claim to reproduce it.

macOS denied access to `~/Downloads/one-flame-light-logos/`. The light versions therefore use the exact requested colours and the traced repo artwork; they were not compared with those Downloads files.

Created October 8, 2026. Only this new `brand/vector/` folder was added. No existing files were edited, committed, or deployed.
