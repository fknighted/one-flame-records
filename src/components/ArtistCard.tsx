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
    <Link href={`/artists/${slug}`} className="group block">
      {/* Photo — 1:1 */}
      <div className="relative aspect-square bg-oxblood/5 overflow-hidden">
        {photo_url ? (
          <Image
            src={photo_url}
            alt={stage_name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 20 28" className="w-10 h-auto opacity-20" aria-hidden="true">
              <path d="M10 1C10 1 4 9 4 16C4 19.8 6.3 23.1 10 25C13.7 23.1 16 19.8 16 16C16 9 10 1 10 1Z" fill="#8B2A1F" />
            </svg>
          </div>
        )}
      </div>

      <div className="mt-3 px-0.5">
        <p className="font-display font-bold text-oxblood text-xl leading-tight group-hover:text-ochre transition-colors">
          {stage_name}
        </p>
        {hometown && (
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-ink/50">
            {hometown}
          </p>
        )}
      </div>
    </Link>
  );
}
