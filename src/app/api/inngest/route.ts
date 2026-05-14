import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { helloWorld } from "@/lib/inngest/functions/hello";
import { generateVideo } from "@/lib/inngest/functions/generate-video";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld, generateVideo],
});
