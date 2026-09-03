import type { MetadataRoute } from "next";
import { getPublicMenu } from "@/lib/menu";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://richdonscatering.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/menu`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    const categories = await getPublicMenu();
    const itemRoutes: MetadataRoute.Sitemap = categories
      .flatMap((c) => c.items)
      .map((item) => ({
        url: `${siteUrl}/menu/${item.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));

    return [...staticRoutes, ...itemRoutes];
  } catch {
    // If DB is unavailable during static generation, return static routes only
    return staticRoutes;
  }
}
