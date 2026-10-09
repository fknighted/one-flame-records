import type { Metadata } from "next";
import { Big_Shoulders, Archivo } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// Sound System fonts (design-system/building.md).
// Big Shoulders Display is now one family, "Big Shoulders", with an
// optical-size axis; the Display cut is opsz 72, set on font-poster in
// globals.css. Variable weight is required when an extra axis is loaded.
const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  // next/font has no metric overrides for this family, so name a condensed
  // fallback instead of generating one (avoids a build warning).
  adjustFontFallback: false,
  fallback: ["Impact", "Arial Narrow", "sans-serif"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s — One Flame Records",
    default: "One Flame Records",
  },
  description:
    "An independent reggae and dancehall label out of Montego Bay, Jamaica.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://oneflamerecords.com"
  ),
  openGraph: {
    siteName: "One Flame Records",
    locale: "en_US",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bigShoulders.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
