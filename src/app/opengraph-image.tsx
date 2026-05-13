import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "One Flame Records";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#8B2A1F",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {/* Flame mark */}
        <svg width="64" height="88" viewBox="0 0 20 28" fill="none">
          <path
            d="M10 1C10 1 4 9 4 16C4 19.8 6.3 23.1 10 25C13.7 23.1 16 19.8 16 16C16 9 10 1 10 1Z"
            fill="#F5EDD8"
          />
          <path
            d="M10 14C10 14 7.5 17.5 7.5 19.5C7.5 21.4 8.6 23 10 24C11.4 23 12.5 21.4 12.5 19.5C12.5 17.5 10 14 10 14Z"
            fill="#3F5A3A"
          />
        </svg>

        <div
          style={{
            color: "#F5EDD8",
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            fontFamily: "serif",
          }}
        >
          ONE FLAME RECORDS
        </div>

        <div
          style={{
            color: "#ECE2C8",
            fontSize: 22,
            letterSpacing: "0.2em",
            opacity: 0.6,
            fontFamily: "sans-serif",
          }}
        >
          MONTEGO BAY · JAMAICA
        </div>
      </div>
    ),
    { ...size }
  );
}
