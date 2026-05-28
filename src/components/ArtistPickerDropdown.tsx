"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Artist {
  id: string;
  stage_name: string;
}

export function ArtistPickerDropdown({ artists }: { artists: Artist[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded bg-ochre px-4 py-2 text-sm font-semibold text-ink hover:bg-ochre/90 transition-colors"
      >
        + Request video
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-56 rounded-lg border border-bone/20 bg-[#1A1612] shadow-xl z-10">
          <p className="px-3 py-2 text-xs text-bone/40 uppercase tracking-wider border-b border-bone/10">
            Select artist
          </p>
          {artists.length === 0 ? (
            <p className="px-3 py-3 text-xs text-bone/40">No artists yet.</p>
          ) : (
            <div className="py-1">
              {artists.map((a) => (
                <Link
                  key={a.id}
                  href={`/admin/artists/${a.id}/videos/new`}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 text-sm text-bone hover:bg-bone/5 hover:text-ochre transition-colors"
                >
                  {a.stage_name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
