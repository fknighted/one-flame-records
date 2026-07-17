"use client";

export default function WatchLink({ href }: { href: string }) {
  return (
    <span
      onClick={(e) => e.stopPropagation()}
      className="text-xs font-medium text-ochre hover:text-ochre/80 transition-colors"
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        Watch →
      </a>
    </span>
  );
}
