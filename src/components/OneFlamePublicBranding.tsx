"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// These pages keep their own navigation within the shared public layout.
export default function OneFlamePublicBranding({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/haircare" || pathname === "/haircare/styles" || pathname === "/flames-partner" || pathname.startsWith("/flames-partner/")) {
    return null;
  }
  return children;
}
