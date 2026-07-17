"use client";

export type StreamingLinks = {
  spotify?: string;
  apple_music?: string;
  tidal?: string;
  youtube_music?: string;
};

const STREAMING: {
  key: keyof StreamingLinks;
  label: string;
  buildUrl: (v: string) => string;
  path: string;
}[] = [
  {
    key: "spotify",
    label: "Spotify",
    buildUrl: (v) => v.startsWith("http") ? v : `https://open.spotify.com/album/${v}`,
    path: "M6.5 1a5.5 5.5 0 100 11A5.5 5.5 0 006.5 1zm2.5 7.93c-.1.16-.3.2-.46.1-1.27-.78-2.87-.95-4.75-.52-.18.04-.36-.07-.4-.25a.333.333 0 01.25-.4c2.06-.47 3.83-.27 5.26.6.16.1.21.3.1.47zm.67-1.49c-.13.2-.4.26-.6.13-1.45-.89-3.67-1.15-5.38-.63-.22.07-.45-.06-.52-.28s.06-.45.28-.52c1.96-.6 4.4-.3 6.08.72.2.13.26.4.14.58zm.06-1.55C8.06 5.03 5.26 4.93 3.6 5.44a.42.42 0 01-.52-.28.42.42 0 01.27-.53c1.9-.58 5.06-.47 7.06.82.24.15.31.46.16.7-.15.23-.46.31-.7.16z",
  },
  {
    key: "apple_music",
    label: "Apple Music",
    buildUrl: (v) => v.startsWith("http") ? v : `https://music.apple.com/album/${v}`,
    path: "M4 9.5V3.5l6-1v6M4 9.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM10 8.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z",
  },
  {
    key: "youtube_music",
    label: "YouTube Music",
    buildUrl: (v) => v.startsWith("http") ? v : `https://music.youtube.com/browse/${v}`,
    path: "M6.5 1a5.5 5.5 0 100 11A5.5 5.5 0 006.5 1zm-1 7.6V4.4l4 2.1-4 2.1z",
  },
  {
    key: "tidal",
    label: "Tidal",
    buildUrl: (v) => v.startsWith("http") ? v : `https://tidal.com/browse/album/${v}`,
    path: "M4.5 2.5L6.5 4.5 4.5 6.5 2.5 4.5zM8.5 2.5L10.5 4.5 8.5 6.5 6.5 4.5zM4.5 6.5L6.5 8.5 4.5 10.5 2.5 8.5z",
  },
];

export default function StreamingIcons({ links }: { links: StreamingLinks }) {
  const active = STREAMING.filter(({ key }) => links[key]);
  if (!active.length) return <span className="text-bone/52 text-xs">—</span>;
  return (
    <div className="flex items-center gap-2">
      {active.map(({ key, label, buildUrl, path }) => (
        <a
          key={key}
          href={buildUrl(links[key]!)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="text-bone/60 hover:text-ochre transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor" aria-hidden="true">
            <path d={path} />
          </svg>
        </a>
      ))}
    </div>
  );
}
