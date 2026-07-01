import { inngest } from "@/lib/inngest/client";
import { createServiceClient } from "@/lib/supabase/server";
import { uploadToYouTube } from "@/lib/youtube";

type UploadSource = "video" | "video_job";

export const uploadToYoutubeJob = inngest.createFunction(
  {
    id: "upload-to-youtube",
    triggers: [{ event: "youtube/upload.requested" }],
    retries: 1,
    onFailure: async ({ error, event }) => {
      const { source, id } = (event.data as unknown as { event: { data: { source: UploadSource; id: string } } }).event.data;
      const supabase = createServiceClient();
      const table = source === "video" ? "videos" : "video_jobs";
      await supabase
        .from(table)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ youtube_upload_status: "failed" } as any)
        .eq("id", id);
      console.error(`YouTube upload failed for ${source} ${id}:`, error.message);
    },
  },
  async ({ event, step }) => {
    const { source, id } = event.data as { source: UploadSource; id: string };

    const { title, description, videoUrl } = await step.run("load-record", async () => {
      const supabase = createServiceClient();

      if (source === "video") {
        const { data, error } = await supabase
          .from("videos")
          .select("title, storage_url, artists(stage_name)")
          .eq("id", id)
          .single();
        if (error || !data) throw new Error(`Video not found: ${id}`);
        if (!data.storage_url) throw new Error(`Video ${id} has no storage_url to upload`);

        const artistName =
          (Array.isArray(data.artists) ? data.artists[0] : data.artists)?.stage_name ?? "";
        const desc = artistName
          ? `${artistName} — ${data.title}\n\nOne Flame Records`
          : `${data.title}\n\nOne Flame Records`;

        return { title: data.title, description: desc, videoUrl: data.storage_url };
      }

      // source === "video_job"
      const { data: job, error: jobErr } = await supabase
        .from("video_jobs")
        .select("id, params, assets(title), artists(stage_name)")
        .eq("id", id)
        .single();
      if (jobErr || !job) throw new Error(`Video job not found: ${id}`);

      // Reconstruct the storage path from the job ID (always videos/{id}.mp4 in generated-videos)
      const storagePath = `videos/${id}.mp4`;
      const { data: signed } = await supabase.storage
        .from("generated-videos")
        .createSignedUrl(storagePath, 3600); // 1h — enough for the upload step
      if (!signed?.signedUrl) throw new Error(`Could not sign URL for video_job ${id}`);

      const assetTitle =
        (Array.isArray(job.assets) ? job.assets[0] : job.assets)?.title ?? "Untitled";
      const artistName =
        (Array.isArray(job.artists) ? job.artists[0] : job.artists)?.stage_name ?? "";
      const videoTitle = artistName ? `${artistName} — ${assetTitle}` : assetTitle;
      const desc = artistName
        ? `${artistName} — ${assetTitle}\n\nOne Flame Records`
        : `${assetTitle}\n\nOne Flame Records`;

      return { title: videoTitle, description: desc, videoUrl: signed.signedUrl };
    });

    const youtubeId = await step.run("upload-video", () =>
      uploadToYouTube({ title, description, videoUrl, privacyStatus: "private" })
    );

    await step.run("save-result", async () => {
      const supabase = createServiceClient();
      const table = source === "video" ? "videos" : "video_jobs";
      const update =
        source === "video"
          ? { youtube_id: youtubeId, youtube_upload_status: "done" }
          : { youtube_id: youtubeId, youtube_upload_status: "done" };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from(table).update(update as any).eq("id", id);
      if (error) throw new Error(`Failed to save YouTube ID: ${error.message}`);
    });

    return { youtubeId };
  }
);
