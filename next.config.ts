import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  serverExternalPackages: ["music-metadata"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Gamer features were removed on 2026-10-09 (database tables kept). Old gamer
  // and member-management links land on the nearest live page.
  async redirects() {
    return [
      { source: "/gamer-signup", destination: "/flames-lounge", permanent: false },
      { source: "/gamer", destination: "/", permanent: false },
      { source: "/gamer/:path*", destination: "/", permanent: false },
      { source: "/bar/members", destination: "/bar", permanent: false },
      { source: "/bar/members/:path*", destination: "/bar", permanent: false },
      { source: "/admin/bar/members", destination: "/admin/bar", permanent: false },
      { source: "/admin/bar/members/:path*", destination: "/admin/bar", permanent: false },
    ];
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
