import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://rd-catering.vercel.app");

  const siteUrl = rawUrl.replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/menu",
          "/events",
          "/corporate",
          "/terms",
          "/privacy",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/api",
          "/api/",
          "/corporate/*",
          "/cart",
          "/checkout",
          "/order",
          "/order/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
