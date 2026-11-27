import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type PublicHeroPromo = {
  id: string;
  title: string;
  subtitle: string;
  badgeText: string;
  imageUrl: string;
  description: string | null;
  price: number | null;
  linkUrl: string | null;
  isActive: boolean;
};

export const getActiveHeroPromo = unstable_cache(
  async (): Promise<PublicHeroPromo | null> => {
    try {
      const promo = await prisma.heroPromo.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: "desc" },
      });

      if (!promo) return null;

      return {
        id: promo.id,
        title: promo.title,
        subtitle: promo.subtitle || "Holiday Special",
        badgeText: promo.badgeText || "SPECIAL / GH",
        imageUrl: promo.imageUrl,
        description: promo.description,
        price: promo.price ? Number(promo.price) : null,
        linkUrl: promo.linkUrl || "/menu",
        isActive: promo.isActive,
      };
    } catch (error) {
      console.error("Error fetching active hero promo:", error);
      return null;
    }
  },
  ["active-hero-promo"],
  { revalidate: 60 } // 1 min — promos change more often
);

export async function getLatestHeroPromo(): Promise<PublicHeroPromo | null> {
  try {
    const promo = await prisma.heroPromo.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!promo) return null;

    return {
      id: promo.id,
      title: promo.title,
      subtitle: promo.subtitle || "Holiday Special",
      badgeText: promo.badgeText || "SPECIAL / GH",
      imageUrl: promo.imageUrl,
      description: promo.description,
      price: promo.price ? Number(promo.price) : null,
      linkUrl: promo.linkUrl || "/menu",
      isActive: promo.isActive,
    };
  } catch (error) {
    console.error("Error fetching latest hero promo:", error);
    return null;
  }
}
