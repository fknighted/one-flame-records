"use client";

import { useTransition, useState } from "react";
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
  const [error,setError]=useState<string|null>(null);
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

  if(uploadStatus === "review") return <p role="alert" className="studio-error">Upload result needs review. Check the private uploads in YouTube Studio before retrying.</p>;

  // Failed — allow retry
  const isFailed = uploadStatus === "failed";

  return (
    <span>{error && <span role="alert" className="studio-error">{error}</span>}<button
      onClick={() => {
        startTransition(async () => {
          setError(null);
          try { const result=await requestYouTubeUpload(source,id);if(result?.error)setError(result.error); }
          catch {setError("Could not confirm this request. Please retry.");}
          router.refresh();
        });
      }}
      className={`studio-btn studio-btn-sm whitespace-nowrap ${
        isFailed ? "studio-btn-danger" : "studio-btn-secondary"
      }`}
    >
      {isFailed ? "Retry YouTube" : "Upload to YouTube"}
    </button></span>
  );
}
