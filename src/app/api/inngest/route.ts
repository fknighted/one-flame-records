import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { storageCleanup } from "@/lib/inngest/functions/storage-cleanup";
import { helloWorld } from "@/lib/inngest/functions/hello";
import { uploadToYoutubeJob } from "@/lib/inngest/functions/upload-to-youtube";

export const maxDuration = 300; // Retained for YouTube uploads.

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld, uploadToYoutubeJob, storageCleanup],
});
