import Image from "next/image";
import Link from "next/link";

type StreamingLinks = {
  spotify?: string;
  apple?: string;
  youtube?: string;
  soundcloud?: string;
  tidal?: string;
};

type Props = {
  slug: string;
  title: string;
  cover_url: string;
  release_date: string;
  type: string;
  artist_name: string;
  artist_slug: string;
  streaming_links: StreamingLinks;
  dark?: boolean;
};

const TYPE_STYLES: Record<string, string> = {
  single:  "bg-ochre text-ink",
  ep:      "bg-forest text-bone",
  album:   "bg-oxblood text-bone",
  mixtape: "bg-ink text-bone",
};

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const STREAMING_ICONS: { key: keyof StreamingLinks; label: string; icon: React.ReactNode }[] = [
  {
    key: "spotify",
    label: "Spotify",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M16.5 10.5C14 9 10 9 7.5 10.5M15.5 13C13.5 12 10.5 12 8.5 13M14.5 15.5C13 15 11 15 9.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    key: "apple",
    label: "Apple Music",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M9 18V6l12-3v12" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="15" r="3" />
      </svg>
    ),
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
        <polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: "soundcloud",
    label: "SoundCloud",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 14.5a2.5 2.5 0 005 0V13c0-.28-.22-.5-.5-.5s-.5.22-.5.5v1.5a1.5 1.5 0 01-3 0V13c0-.28-.22-.5-.5-.5s-.5.22-.5.5v1.5zm5.5.5h9a3.5 3.5 0 000-7c-.22 0-.44.02-.65.07A5 5 0 002.5 11.5a.5.5 0 001 0A4 4 0 0110 8a.5.5 0 01.5.5V15h-3V13a.5.5 0 00-1 0v2z" />
      </svg>
    ),
  },
  {
    key: "tidal",
    label: "Tidal",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 6l4 4-4 4-4-4 4-4zm4 4l4 4-4 4-4-4 4-4zm-8 0l4 4-4 4-4-4 4-4z" />
      </svg>
    ),
  },
];

export default function ReleaseCard({
  slug,
  title,
  cover_url,
  release_date,
  type,
  artist_name,
  artist_slug,
  streaming_links,
  dark = false,
}: Props) {
  const pillStyle = TYPE_STYLES[type] ?? "bg-ink/10 text-ink";
  const activeLinks = STREAMING_ICONS.filter(({ key }) => streaming_links[key]);

  return (
    <div className="group flex flex-col">
      {/* Cover */}
      <Link href={`/releases/${slug}`} className="block relative aspect-square overflow-hidden ring-1 ring-white/5">
        {cover_url ? (
          <Image
            src={cover_url}
            alt={`${title} cover`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 bg-ink flex items-center justify-center">
            <svg viewBox="0 0 20 28" className="w-10 h-auto opacity-15" aria-hidden="true">
              <path d="M10 1C10 1 4 9 4 16C4 19.8 6.3 23.1 10 25C13.7 23.1 16 19.8 16 16C16 9 10 1 10 1Z" fill="#8B2A1F" />
            </svg>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="mt-2.5 flex flex-col flex-1 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/releases/${slug}`}
            className={`font-display font-bold text-base leading-tight transition-colors ${
              dark ? "text-bone hover:text-ochre" : "text-oxblood hover:text-ochre"
            }`}
          >
            {title}
          </Link>
          <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-sm ${pillStyle}`}>
            {type}
          </span>
        </div>
        <Link
          href={`/artists/${artist_slug}`}
          className={`mt-0.5 text-sm transition-colors ${
            dark ? "text-bone/50 hover:text-ochre" : "text-ink/60 hover:text-oxblood"
          }`}
        >
          {artist_name}
        </Link>
        <p className={`mt-0.5 text-xs ${dark ? "text-bone/30" : "text-ink/40"}`}>
          {formatDate(release_date)}
        </p>

        {activeLinks.length > 0 && (
          <div className="mt-2.5 flex items-center gap-3">
            {activeLinks.map(({ key, label, icon }) => (
              <a
                key={key}
                href={streaming_links[key]!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={`transition-colors ${
                  dark ? "text-bone/40 hover:text-ochre" : "text-ink/40 hover:text-oxblood"
                }`}
              >
                {icon}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
