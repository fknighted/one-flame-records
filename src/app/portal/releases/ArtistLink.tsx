"use client";

type Props = {
  stageName: string | null;
  slug: string | null;
};

export default function ArtistLink({ stageName, slug }: Props) {
  return (
    <span
      className="text-[14px] text-muted hover:text-paper transition-colors truncate"
      onClick={(e) => {
        e.preventDefault();
        if (slug) window.location.href = `/artists/${slug}`;
      }}
    >
      {stageName ?? "—"}
    </span>
  );
}
