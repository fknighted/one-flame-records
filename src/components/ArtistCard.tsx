import Image from "next/image";
import Link from "next/link";

type Props = {
  slug: string;
  stage_name: string;
  photo_url: string | null;
  hometown: string | null;
};

export default function ArtistCard({ slug, stage_name, photo_url, hometown }: Props) {
  return (
    <Link href={`/artists/${slug}`} className="group block relative aspect-square overflow-hidden bg-ink">
      {/* Photo */}
      {photo_url ? (
        <Image
          src={photo_url}
          alt={stage_name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-ink">
          <svg viewBox="0 0 20 28" className="w-12 h-auto opacity-15" aria-hidden="true">
            <path d="M10 1C10 1 4 9 4 16C4 19.8 6.3 23.1 10 25C13.7 23.1 16 19.8 16 16C16 9 10 1 10 1Z" fill="#8B2A1F" />
            <path d="M10 14C10 14 7.5 17.5 7.5 19.5C7.5 21.4 8.6 23 10 24C11.4 23 12.5 21.4 12.5 19.5C12.5 17.5 10 14 10 14Z" fill="#3F5A3A" />
          </svg>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent transition-opacity duration-300 group-hover:from-ink/80" />

      {/* Name + hometown pinned to bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="font-display font-bold text-bone text-lg leading-tight drop-shadow">
          {stage_name}
        </p>
        {hometown && (
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bone/55">
            {hometown}
          </p>
        )}
      </div>
    </Link>
  );
}
