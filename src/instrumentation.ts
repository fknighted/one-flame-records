import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// Forward errors thrown in Server Components, Route Handlers, and Server Actions
// to Sentry. Without this, server-side errors never reach Sentry (capture was
// effectively client-only).
export const onRequestError = Sentry.captureRequestError;
