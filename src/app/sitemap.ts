import type { MetadataRoute } from "next";
import { createServiceClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://oneflamerecords.com";

  const supabase = createServiceClient();

  const [{ data: artists }, { data: releases }] = await Promise.all([
    supabase
      .from("artists")
      .select("slug, updated_at")
      .eq("status", "active"),
    supabase.from("releases").select("slug, updated_at"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,                  lastModified: new Date(), changeFrequency: "weekly",  priority: 1   },
    { url: `${base}/artists`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/releases`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/videos`,      lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/about`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`,     lastModified: new Date(), changeFrequency: "yearly",  priority: 0.5 },
  ];

  const artistRoutes: MetadataRoute.Sitemap = (artists ?? []).map((a) => ({
    url: `${base}/artists/${a.slug}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const releaseRoutes: MetadataRoute.Sitemap = (releases ?? []).map((r) => ({
    url: `${base}/releases/${r.slug}`,
    lastModified: new Date(r.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...artistRoutes, ...releaseRoutes];
}
