import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  async headers() {
    return [{source:"/:path*",headers:[
      {key:"X-Content-Type-Options",value:"nosniff"},
      {key:"X-Frame-Options",value:"DENY"},
      {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
      {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"},
      {key:"Content-Security-Policy",value:"object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"},
      {key:"Content-Security-Policy-Report-Only",value:"default-src 'self'; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' blob: https://*.supabase.co; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.vercel-insights.com https://vercel.live; frame-src https://www.youtube.com https://www.youtube-nocookie.com https://open.spotify.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"},
    ]}];
  },
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
  authToken: process.env.SENTRY_AUTH_TOKEN,
  telemetry: false,
});
