// The two SVG colour filters behind the three-tone photo print
// (design-system/building.md, "Three-tone photos"). Render once per page; the
// public layout does this. Photos opt in with the print-yellow / print-red
// utility classes or <PrintedPhoto>. Each table maps dark tones to black, the
// middle to the block colour and the brightest part to paper (middle strength:
// black, colour, colour, paper). Never add a green filter.
const GREYSCALE =
  "0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0";

export default function PrintFilters() {
  return (
    <svg
      width="0"
      height="0"
      className="absolute w-0 h-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
      focusable="false"
    >
      <filter id="print-yellow" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values={GREYSCALE} />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.059 0.949 0.949 1" />
          <feFuncG type="table" tableValues="0.051 0.761 0.761 0.969" />
          <feFuncB type="table" tableValues="0.043 0.188 0.188 0.902" />
        </feComponentTransfer>
      </filter>
      <filter id="print-red" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values={GREYSCALE} />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.059 0.784 0.784 1" />
          <feFuncG type="table" tableValues="0.051 0.196 0.196 0.969" />
          <feFuncB type="table" tableValues="0.043 0.122 0.122 0.902" />
        </feComponentTransfer>
      </filter>
    </svg>
  );
}
