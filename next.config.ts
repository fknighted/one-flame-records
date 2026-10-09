import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  serverExternalPackages: ["music-metadata"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Public gamer sign-up was removed on 2026-10-09; gamer accounts are now
  // created by bar staff only. Old links land on the Lounge page.
  async redirects() {
    return [{ source: "/gamer-signup", destination: "/flames-lounge", permanent: false }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // YouTube thumbnails
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
