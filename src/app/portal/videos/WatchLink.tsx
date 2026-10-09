"use client";

export default function WatchLink({ href }: { href: string }) {
  return (
    <span
      onClick={(e) => e.stopPropagation()}
      className="text-[15px]"
    >
      <a href={href} target="_blank" rel="noopener noreferrer" className="studio-link studio-focus">
        Watch
      </a>
    </span>
  );
}
