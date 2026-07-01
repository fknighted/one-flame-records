import { Readable } from "stream";
import { google } from "googleapis";

function getYouTubeClient() {
  const auth = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET
  );
  auth.setCredentials({ refresh_token: process.env.YOUTUBE_REFRESH_TOKEN });
  return google.youtube({ version: "v3", auth });
}

export async function uploadToYouTube({
  title,
  description,
  videoUrl,
  privacyStatus = "private",
}: {
  title: string;
  description: string;
  videoUrl: string;
  privacyStatus?: "public" | "private" | "unlisted";
}): Promise<string> {
  const youtube = getYouTubeClient();

  const response = await fetch(videoUrl);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to fetch video for YouTube upload (${response.status}): ${videoUrl}`);
  }

  // Stream the video bytes directly to YouTube's resumable upload API.
  // Avoids buffering the entire file in memory.
  const stream = Readable.fromWeb(
    response.body as Parameters<typeof Readable.fromWeb>[0]
  );

  const res = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title,
        description,
        categoryId: "10", // Music
      },
      status: { privacyStatus },
    },
    media: {
      mimeType: "video/mp4",
      body: stream,
    },
  });

  const youtubeId = res.data.id;
  if (!youtubeId) throw new Error("YouTube upload succeeded but returned no video ID");
  return youtubeId;
}
