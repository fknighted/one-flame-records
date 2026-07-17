"use client";

type Props = {
  stageName: string | null;
  slug: string | null;
};

export default function ArtistLink({ stageName, slug }: Props) {
  return (
    <span
      className="text-[13px] text-bone/70 hover:text-ochre transition-colors truncate"
      onClick={(e) => {
        e.preventDefault();
        if (slug) window.location.href = `/artists/${slug}`;
      }}
    >
      {stageName ?? "—"}
    </span>
  );
}
