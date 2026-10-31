import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Cache and revalidate at most once every hour

const KNOWN_DISH_FALLBACKS = [
  "fufu-and-palmnut-soup",
  "jollof-rice-grilled-chicken",
  "fried-rice-with-chicken",
  "charcoal-grilled-chicken",
  "rice-dish-combo",
  "kosua-ne-mako",
  "ghanaian-salad",
  "packed-pastries",
];

function getBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://rd-catering.vercel.app");

  return raw.replace(/\/+$/, "");
}

function toAbsoluteImageUrl(baseUrl: string, imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  const trimmed = imageUrl.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `${baseUrl}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

/**
 * Generates the XML sitemap for Google Search Console and web crawlers.
 * Includes all public indexable landing pages and dynamically fetched menu items.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getBaseUrl();
  const now = new Date();

  // Core public indexable landing pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
      images: [`${siteUrl}/og-image.jpg`],
    },
    {
      url: `${siteUrl}/menu`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/events`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/corporate`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  try {
    const dishes = await prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        category: { isActive: true },
      },
      select: {
        slug: true,
        imageUrl: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    if (dishes.length === 0) {
      throw new Error("No active dishes returned from database");
    }

    const dishRoutes: MetadataRoute.Sitemap = dishes.map((dish) => {
      const absoluteImage = toAbsoluteImageUrl(siteUrl, dish.imageUrl);
      return {
        url: `${siteUrl}/menu/${dish.slug}`,
        lastModified: dish.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
        ...(absoluteImage ? { images: [absoluteImage] } : {}),
      };
    });

    return [...staticRoutes, ...dishRoutes];
  } catch (error) {
    console.warn("Sitemap: serving static fallback dishes due to DB error:", error);

    const fallbackRoutes: MetadataRoute.Sitemap = KNOWN_DISH_FALLBACKS.map((slug) => ({
      url: `${siteUrl}/menu/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...fallbackRoutes];
  }
}
