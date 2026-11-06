"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// Flames Partner keeps its own navigation within the shared public layout.
export default function OneFlamePublicBranding({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/flames-partner" || pathname.startsWith("/flames-partner/")) {
    return null;
  }
  return children;
}
