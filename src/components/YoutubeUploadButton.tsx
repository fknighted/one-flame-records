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
        className="text-xs text-ochre hover:text-ochre/70 transition-colors whitespace-nowrap"
      >
        YouTube ↗
      </a>
    );
  }

  // In-flight (optimistic or confirmed from DB)
  if (uploadStatus === "uploading" || isPending) {
    return (
      <span className="text-xs text-ochre/50 whitespace-nowrap">Uploading…</span>
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
      className={`text-xs whitespace-nowrap transition-colors ${
        isFailed
          ? "text-red-400 hover:text-red-300"
          : "text-bone/40 hover:text-ochre"
      }`}
    >
      {isFailed ? "Retry YouTube ↑" : "Upload to YouTube"}
    </button>
  );
}
