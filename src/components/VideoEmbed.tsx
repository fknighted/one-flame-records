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
        <div className="relative aspect-video bg-ink overflow-hidden rounded">
          <video
            src={storage_url}
            controls
            className="absolute inset-0 w-full h-full object-cover"
            title={title}
          />
        </div>
        <div className="mt-2.5 px-0.5">
          <p className="font-medium text-ink leading-snug line-clamp-2">{title}</p>
          <p className="mt-0.5 text-xs text-ink/50">{artist_name}</p>
        </div>
      </div>
    );
  }

  // YouTube embed (existing behaviour)
  if (youtube_id) {
    const thumbnail = `https://img.youtube.com/vi/${youtube_id}/hqdefault.jpg`;
    return (
      <div className="group flex flex-col">
        <div className="relative aspect-video bg-ink overflow-hidden">
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
              className="absolute inset-0 w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood"
              aria-label={`Play ${title}`}
            >
              <Image
                src={thumbnail}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={priority}
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-14 h-14 rounded-full bg-oxblood/90 flex items-center justify-center shadow-lg group-hover:bg-ochre transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </span>
              </span>
            </button>
          )}
        </div>
        <div className="mt-2.5 px-0.5">
          <p className="font-medium text-ink leading-snug line-clamp-2">{title}</p>
          <p className="mt-0.5 text-xs text-ink/50">{artist_name}</p>
        </div>
      </div>
    );
  }

  return null;
}
