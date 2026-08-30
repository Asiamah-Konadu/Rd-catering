import { prisma } from "@/lib/prisma";

export type PublicMenuItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  isAvailable: boolean;
  isFeatured: boolean;
  category: {
    name: string;
    slug: string;
  };
};

function serializeMenuItem(item: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  price: { toString(): string };
  isAvailable: boolean;
  isFeatured: boolean;
  category: { name: string; slug: string };
}): PublicMenuItem {
  return {
    ...item,
    price: Number(item.price.toString()),
  };
}

export async function getPublicMenu() {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      menuItems: { some: { isAvailable: true } },
    },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      menuItems: {
        where: { isAvailable: true },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          imageUrl: true,
          price: true,
          isAvailable: true,
          isFeatured: true,
          category: { select: { name: true, slug: true } },
        },
      },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    items: category.menuItems.map(serializeMenuItem),
  }));
}

export async function getFeaturedMenu() {
  const categories = await getPublicMenu();
  return categories.flatMap((category) => category.items).filter((item) => item.isFeatured);
}

export async function getPublicMenuItem(slug: string) {
  const item = await prisma.menuItem.findFirst({
    where: {
      slug,
      category: { isActive: true },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      price: true,
      isAvailable: true,
      isFeatured: true,
      category: { select: { name: true, slug: true } },
    },
  });

  return item ? serializeMenuItem(item) : null;
}

export async function getDailyPick(): Promise<PublicMenuItem | null> {
  const featuredItem = await prisma.menuItem.findFirst({
    where: {
      isAvailable: true,
      isFeatured: true,
      category: { isActive: true },
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      price: true,
      isAvailable: true,
      isFeatured: true,
      category: { select: { name: true, slug: true } },
    },
  });

  if (featuredItem) {
    return serializeMenuItem(featuredItem);
  }

  const anyItem = await prisma.menuItem.findFirst({
    where: {
      isAvailable: true,
      category: { isActive: true },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      price: true,
      isAvailable: true,
      isFeatured: true,
      category: { select: { name: true, slug: true } },
    },
  });

  return anyItem ? serializeMenuItem(anyItem) : null;
}