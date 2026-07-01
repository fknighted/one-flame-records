import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { helloWorld } from "@/lib/inngest/functions/hello";
import { generateVideo } from "@/lib/inngest/functions/generate-video";
import { generateCampaign } from "@/lib/inngest/functions/generate-campaign";
import { generateCampaignVideo } from "@/lib/inngest/functions/generate-campaign-video";
import { regenerateCampaignPiece } from "@/lib/inngest/functions/regenerate-campaign-piece";
import { uploadToYoutubeJob } from "@/lib/inngest/functions/upload-to-youtube";

export const maxDuration = 300; // Vercel Pro max — needed for ffmpeg assembly step

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld, generateVideo, generateCampaign, generateCampaignVideo, regenerateCampaignPiece, uploadToYoutubeJob],
});
