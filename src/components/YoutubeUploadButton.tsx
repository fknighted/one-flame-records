"use client";

import { useTransition } from "react";
import { requestYouTubeUpload } from "@/app/admin/videos/actions";
import { useRouter } from "next/navigation";

interface Props {
  source: "video" | "video_job";
  id: string;
  youtubeId: string | null;
  uploadStatus: string | null;
}

export default function YoutubeUploadButton({ source, id, youtubeId, uploadStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Already on YouTube
  if (youtubeId && uploadStatus === "done") {
    return (
      <a
        href={`https://www.youtube.com/watch?v=${youtubeId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="studio-btn studio-btn-secondary studio-btn-sm whitespace-nowrap"
      >
        YouTube
      </a>
    );
  }

  // In-flight (optimistic or confirmed from DB)
  if (uploadStatus === "uploading" || isPending) {
    return (
      <span className="text-sm text-muted whitespace-nowrap">Uploading…</span>
    );
  }

  // Failed — allow retry
  const isFailed = uploadStatus === "failed";

  return (
    <button
      onClick={() => {
        startTransition(async () => {
          await requestYouTubeUpload(source, id);
          router.refresh();
        });
      }}
      className={`studio-btn studio-btn-sm whitespace-nowrap ${
        isFailed ? "studio-btn-danger" : "studio-btn-secondary"
      }`}
    >
      {isFailed ? "Retry YouTube" : "Upload to YouTube"}
    </button>
  );
}
