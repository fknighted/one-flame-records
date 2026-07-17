import { inngest } from "./client";

/**
 * A missing/unconfigured Inngest event key makes `inngest.send()` throw with a
 * message that mentions the event key. That case is tolerable — the caller's job
 * row already exists and can be triggered manually from admin — so we distinguish
 * it from genuine dispatch failures (network, 5xx) that must surface.
 */
function isMissingEventKeyError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /event key/i.test(msg);
}

/**
 * Fire `video/generate.requested` for an existing job row.
 *
 * Returns `true` if the event was accepted, `false` if it was skipped because no
 * Inngest event key is configured (the job row can still be triggered manually).
 * Any other failure is re-thrown so the caller can surface it rather than leaving
 * a job that will silently never run.
 */
export async function sendVideoGenerateRequest(jobId: string): Promise<boolean> {
  try {
    await inngest.send({ name: "video/generate.requested", data: { jobId } });
    return true;
  } catch (err) {
    if (isMissingEventKeyError(err)) return false;
    throw err;
  }
}
