import { prisma } from "@/lib/prisma";

export interface ShowcaseDishItem {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  origin: string;
  price: number;
  imageUrl: string;
  flavorNotes: string[];
  badge: string;
  isActive: boolean;
}

export interface ShowcaseConfig {
  title: string;
  subtitle: string;
  kicker: string;
  ctaText: string;
  ctaUrl: string;
  items: ShowcaseDishItem[];
}

export const DEFAULT_SHOWCASE_CONFIG: ShowcaseConfig = {
  title: "What sounds good?",
  subtitle:
    "Handcrafted Ghanaian favourites cooked to order. Explore the craftsmanship and aroma of our kitchen, then dive into the full menu.",
  kicker: "Accra Kitchen Showcase · Handcrafted Favourites",
  ctaText: "Explore Full Kitchen Menu",
  ctaUrl: "/menu",
  items: [
    {
      id: "sc-1",
      name: "Smoky Ghanaian Jollof",
      slug: "jollof-rice",
      tagline: "Fire-Roasted Plum Tomato Reduction & Jasmine Rice",
      description:
        "Slow-cooked in a rich, deeply spiced base of blended plum tomatoes, fiery Scotch bonnet peppers, sweet onions, rosemary, and smoked paprika.",
      category: "Rice Classics",
      origin: "Accra Fire Pots",
      price: 65,
      imageUrl: "/coming-soon/jolof.avif",
      flavorNotes: ["Woodfire Smoke", "Scotch Bonnet", "Plum Tomato"],
      badge: "Signature Classic",
      isActive: true,
    },
    {
      id: "sc-2",
      name: "Authentic Accra Waakye",
      slug: "waakye",
      tagline: "Indigenous Sorghum Leaf Infusion & Slow-Simmered Beans",
      description:
        "Fragrant rice and cowpeas boiled with indigenous sun-dried sorghum leaves, served with rich black pepper shito, gari foto, and boiled farm egg.",
      category: "Heritage Specialties",
      origin: "Traditional Heritage",
      price: 60,
      imageUrl: "/coming-soon/waakye.jpg",
      flavorNotes: ["Sorghum Leaf", "Black Shito", "Cowpeas"],
      badge: "Heritage Favourite",
      isActive: true,
    },
    {
      id: "sc-3",
      name: "Banku & Grilled Tilapia",
      slug: "banku-tilapia",
      tagline: "Char-Grilled Lake Volta Tilapia & Raw Pepper Salsa",
      description:
        "Fresh whole tilapia marinated in ginger, garlic, cloves, and local spices, charred over open embers with fresh ground chilli and shallots.",
      category: "Coastal Favourites",
      origin: "Coastal Fire Pit",
      price: 85,
      imageUrl: "/coming-soon/banku-and-tilapia.jpg",
      flavorNotes: ["Smoked Tilapia", "Green Chilli", "Fermented Corn"],
      badge: "Fresh Catch",
      isActive: true,
    },
    {
      id: "sc-4",
      name: "Special Chef's Fried Rice",
      slug: "fried-rice",
      tagline: "High-Flame Jasmine Rice with Crisp Garden Vegetables",
      description:
        "Wok-tossed over intense kitchen heat with farm-fresh carrots, sweet corn, green peas, scallions, and aromatic sesame reduction.",
      category: "Chef Signature",
      origin: "Wok Specialty",
      price: 65,
      imageUrl: "/coming-soon/fried-rice.png",
      flavorNotes: ["Wok Hei Smoke", "Toasted Sesame", "Crisp Scallions"],
      badge: "Chef's Choice",
      isActive: true,
    },
    {
      id: "sc-5",
      name: "Golden Belgian Waffles",
      slug: "waffles",
      tagline: "Crisp Golden Lattice with Wild Blossom Honey",
      description:
        "Freshly baked Belgian waffles with deep pockets, crisp outer edges, tender buttery crumb, whipped cream, and raw flower blossom honey.",
      category: "Brunch & Sweet",
      origin: "Artisan Bakery",
      price: 45,
      imageUrl: "/coming-soon/Waffle.jpg",
      flavorNotes: ["Madagascar Vanilla", "Whipped Cream", "Raw Blossom Honey"],
      badge: "Sweet Treat",
      isActive: true,
    },
    {
      id: "sc-6",
      name: "Tropical Sunshine Smoothies",
      slug: "smoothies",
      tagline: "Chilled Ghanaian Mango, Sweet Pineapple & Ginger Zest",
      description:
        "A vibrant, velvety nectar blended with sun-ripened Accra mangoes, golden pineapple, passion fruit pulp, and a subtle fiery zing of ginger.",
      category: "Chilled Refreshers",
      origin: "Cold Pressed",
      price: 35,
      imageUrl: "/coming-soon/smoothies.jpg",
      flavorNotes: ["Sun-Ripened Mango", "Golden Pineapple", "Spicy Ginger"],
      badge: "Chilled & Fresh",
      isActive: true,
    },
  ],
};

const SHOWCASE_SLUG = "home-webgl-showcase";

export async function getShowcaseConfig(): Promise<ShowcaseConfig> {
  try {
    const page = await prisma.cmsPage.findUnique({
      where: { slug: SHOWCASE_SLUG },
    });

    if (page && page.content) {
      const parsed = JSON.parse(page.content);
      if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
        return {
          title: parsed.title || DEFAULT_SHOWCASE_CONFIG.title,
          subtitle: parsed.subtitle || DEFAULT_SHOWCASE_CONFIG.subtitle,
          kicker: parsed.kicker || DEFAULT_SHOWCASE_CONFIG.kicker,
          ctaText: parsed.ctaText || DEFAULT_SHOWCASE_CONFIG.ctaText,
          ctaUrl: parsed.ctaUrl || DEFAULT_SHOWCASE_CONFIG.ctaUrl,
          items: parsed.items,
        };
      }
    }
  } catch (err) {
    console.error("Failed to read showcase config from database:", err);
  }

  return DEFAULT_SHOWCASE_CONFIG;
}

export async function saveShowcaseConfig(config: ShowcaseConfig): Promise<boolean> {
  try {
    const jsonString = JSON.stringify(config);
    await prisma.cmsPage.upsert({
      where: { slug: SHOWCASE_SLUG },
      create: {
        slug: SHOWCASE_SLUG,
        title: config.title || "Home Food Showcase",
        content: jsonString,
        isPublished: true,
      },
      update: {
        title: config.title || "Home Food Showcase",
        content: jsonString,
        isPublished: true,
      },
    });
    return true;
  } catch (err) {
    console.error("Failed to save showcase config:", err);
    return false;
  }
}
