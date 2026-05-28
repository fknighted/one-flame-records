"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function JobsAutoRefresh({ hasActiveJobs }: { hasActiveJobs: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!hasActiveJobs) return;
    const interval = setInterval(() => router.refresh(), 30_000);
    return () => clearInterval(interval);
  }, [hasActiveJobs, router]);

  if (!hasActiveJobs) return null;

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-forest/20 text-forest text-xs font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
      Live
    </span>
  );
}
