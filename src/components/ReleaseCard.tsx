import Image from "next/image";
import Link from "next/link";
import { tooLong } from "@/lib/sound-system";

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

const TYPE_LABELS: Record<string, string> = {
  single:  "Single",
  ep:      "EP",
  album:   "Album",
  mixtape: "Mixtape",
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

/**
 * A release as a small poster: red type band on top, the title on paper (with
 * square, uncropped cover art above it when there is one), then a 3px black
 * rule and a bottom row with the artist and "Listen". Cover art is artwork,
 * so it is not printed in three tones. Same props as before; `dark` is kept so
 * existing pages compile, but the card is paper on any ground.
 */
export default function ReleaseCard({
  slug,
  title,
  cover_url,
  release_date,
  type,
  artist_name,
  artist_slug,
  streaming_links,
}: Props) {
  const typeLabel = TYPE_LABELS[type] ?? type;
  const activeLinks = STREAMING_ICONS.filter(({ key }) => streaming_links[key]);
  const long = tooLong(title);

  return (
    <article className="@container grid grid-rows-[auto_1fr_auto] aspect-[4/5] bg-paper text-black">
      <p className="flex items-center justify-between gap-2 bg-red text-paper px-3 py-2 type-label">
        <span>{typeLabel}</span>
        <span className="type-caption normal-case tracking-normal">{release_date.slice(0, 4)}</span>
      </p>

      <div className="px-3 py-3.5 grid content-end gap-2 min-w-0">
        {cover_url && (
          <Link href={`/releases/${slug}`} tabIndex={-1} aria-hidden="true" className="relative block aspect-square w-full bg-black">
            <Image
              src={cover_url}
              alt=""
              fill
              className="object-contain"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          </Link>
        )}
        <h3 className="min-w-0">
          <Link
            href={`/releases/${slug}`}
            className={`block font-poster font-black uppercase [overflow-wrap:anywhere] hover:text-red focus-on-paper ${
              long
                ? "leading-[0.95] text-[clamp(20px,11cqi,32px)]"
                : "leading-[0.85] text-[clamp(26px,18cqi,46px)]"
            }`}
          >
            {title}
          </Link>
        </h3>
        <p className="type-caption text-black/75">{formatDate(release_date)}</p>
        {activeLinks.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {activeLinks.map(({ key, label, icon }) => (
              <a
                key={key}
                href={streaming_links[key]!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} (opens in a new tab)`}
                className="grid place-items-center w-8 h-8 text-black hover:text-red focus-on-paper"
              >
                {icon}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center gap-2 px-3 py-2.5 border-t-[3px] border-black type-small min-w-0">
        <Link
          href={`/artists/${artist_slug}`}
          className="min-w-0 truncate underline underline-offset-2 hover:text-red focus-on-paper"
        >
          {artist_name}
        </Link>
        <Link
          href={`/releases/${slug}`}
          aria-label={`Listen to ${title}`}
          className="shrink-0 underline underline-offset-2 hover:text-red focus-on-paper"
        >
          Listen
        </Link>
      </div>
    </article>
  );
}
