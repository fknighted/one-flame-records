import { NonRetriableError } from "inngest";
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
      const { source,id,requestId } = (event.data as unknown as {event:{data:{source:UploadSource;id:string;requestId:string}}}).event.data;
      const supabase=createServiceClient();
      const {data:attempt}=await supabase.from("youtube_upload_requests").select("status,youtube_id").eq("request_id",requestId).single();
      if(attempt?.youtube_id){
        const result=await supabase.from(source==="video"?"videos":"video_jobs").update({youtube_id:attempt.youtube_id,youtube_upload_status:"done"}).eq("id",id);
        if(!result.error)return;
      }
      const uncertain=attempt?.status==="started" || attempt?.status==="uncertain" || !!attempt?.youtube_id;
      await supabase.from("youtube_upload_requests").update({status:uncertain?"uncertain":"failed"}).eq("request_id",requestId).neq("status","done");
      await supabase.from(source==="video"?"videos":"video_jobs").update({youtube_upload_status:uncertain?"review":"failed"}).eq("id",id);

      console.error(`YouTube upload failed for ${source} ${id}:`, error.message);
    },
  },
  async ({ event, step }) => {
    const { source, id, requestId } = event.data as { source: UploadSource; id: string; requestId:string };

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

    const youtubeId = await step.run("upload-video", async () => {
      const service=createServiceClient();
      const {data:attempt,error}=await service.from("youtube_upload_requests").select("status,youtube_id").eq("request_id",requestId).single();
      if(error || !attempt) throw new NonRetriableError("Upload request is missing.");
      if(attempt.youtube_id) return attempt.youtube_id;
      const claim=await service.from("youtube_upload_requests").update({status:"started"}).eq("request_id",requestId).eq("status","queued").select("request_id").maybeSingle();
      if(claim.error || !claim.data) throw new NonRetriableError("Previous upload result is uncertain. Check private YouTube uploads before retrying.");
      const result=await uploadToYouTube({title,description,videoUrl,privacyStatus:"private"});
      const saved=await service.from("youtube_upload_requests").update({youtube_id:result,status:"done"}).eq("request_id",requestId);
      if(saved.error) throw new NonRetriableError("YouTube accepted the upload but the receipt was not saved. Manual reconciliation required.");
      return result;
    });

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
