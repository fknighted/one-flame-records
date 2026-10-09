"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// Replaces the root layout, so no stylesheet or font variables are loaded here.
// Everything is inline, using the Sound System palette values.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#0F0D0B",
          color: "#FFF7E6",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "1rem",
          boxSizing: "border-box",
          textAlign: "center",
          fontFamily: "Archivo, system-ui, -apple-system, 'Segoe UI', sans-serif",
          gap: "1rem",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/stacked-light.svg" alt="One Flame Records" height={96} style={{ height: 96, width: "auto" }} />
        <h2
          style={{
            margin: 0,
            fontSize: "2rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            lineHeight: 1.05,
            overflowWrap: "anywhere",
          }}
        >
          Something went wrong
        </h2>
        <button
          onClick={reset}
          style={{
            background: "#F2C230",
            color: "#0F0D0B",
            border: "none",
            borderRadius: 0,
            minHeight: 46,
            padding: "0 1.25rem",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: "0.9375rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
