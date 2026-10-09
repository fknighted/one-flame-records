"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  youtube_id?: string | null;
  storage_url?: string | null;
  title: string;
  artist_name: string;
  priority?: boolean;
};

export default function VideoEmbed({ youtube_id, storage_url, title, artist_name, priority = false }: Props) {
  const [playing, setPlaying] = useState(false);

  // Direct upload — native video element
  if (storage_url && !youtube_id) {
    return (
      <div className="group flex flex-col">
        <div className="aspect-video bg-panel">
          <video
            src={storage_url}
            controls
            preload="metadata"
            className="w-full h-full focus-on-black"
          />
        </div>
        <div className="mt-2.5">
          <p className="type-title-sm text-paper line-clamp-2 [overflow-wrap:anywhere]">{title}</p>
          <p className="mt-1 type-small text-muted">{artist_name}</p>
        </div>
      </div>
    );
  }

  // YouTube embed (existing behaviour)
  if (youtube_id) {
    const thumbnail = `https://img.youtube.com/vi/${youtube_id}/hqdefault.jpg`;
    return (
      <div className="group flex flex-col">
        {/* No overflow-hidden here, so the focus ring sits outside the
            thumbnail on the black ground and never depends on its colours. */}
        <div className="relative aspect-video bg-panel">
          {playing ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtube_id}?autoplay=1&rel=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <button
              onClick={() => setPlaying(true)}
              type="button"
              className="group/play absolute inset-0 w-full h-full focus-on-black"
              aria-label={`Play ${title}`}
            >
              <Image
                src={thumbnail}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={priority}
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-14 h-14 bg-yellow text-black flex items-center justify-center group-hover/play:bg-paper transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </span>
              </span>
            </button>
          )}
        </div>
        <div className="mt-2.5">
          <p className="type-title-sm text-paper line-clamp-2 [overflow-wrap:anywhere]">{title}</p>
          <p className="mt-1 type-small text-muted">{artist_name}</p>
        </div>
      </div>
    );
  }

  return null;
}
