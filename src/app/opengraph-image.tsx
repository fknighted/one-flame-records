import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const alt = "One Flame Records";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Light logo on black, from the brand files (satori renders SVG data URIs).
  const logoData = await readFile(
    path.join(process.cwd(), "public", "brand", "stacked-light.svg")
  );
  const logoSrc = `data:image/svg+xml;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0F0D0B",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img src={logoSrc} width={380} height={500} alt="" />
      </div>
    ),
    { ...size }
  );
}
