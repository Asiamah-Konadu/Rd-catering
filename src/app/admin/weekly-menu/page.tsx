import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/authz";
import { WeeklyMenuAdminClient } from "./WeeklyMenuAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WeeklyMenuAdminPage() {
  const user = await requireAnyRole(["ADMIN", "MENU_MANAGER"]);
  if (!user) redirect("/admin/login");

  let weeklyMenu = await prisma.weeklyMenu.findFirst({
    orderBy: { updatedAt: "desc" },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          menuItem: {
            include: {
              category: { select: { name: true, slug: true } },
            },
          },
        },
      },
    },
  });

  if (!weeklyMenu) {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    weeklyMenu = await prisma.weeklyMenu.create({
      data: {
        title: "This Week's Featured Dishes",
        weekStart,
        weekEnd,
        isPublished: true,
      },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: {
            menuItem: {
              include: {
                category: { select: { name: true, slug: true } },
              },
            },
          },
        },
      },
    });
  }

  const allMenuItems = await prisma.menuItem.findMany({
    where: { isAvailable: true },
    orderBy: { name: "asc" },
    include: {
      category: { select: { name: true, slug: true } },
    },
  });

  const formattedWeeklyMenu = {
    id: weeklyMenu.id,
    title: weeklyMenu.title || "This Week's Featured Dishes",
    isPublished: weeklyMenu.isPublished,
    items: weeklyMenu.items.map((it) => ({
      id: it.id,
      menuItemId: it.menuItemId,
      sortOrder: it.sortOrder,
      name: it.menuItem.name,
      slug: it.menuItem.slug,
      price: Number(it.menuItem.price.toString()),
      imageUrl: it.menuItem.imageUrl,
      categoryName: it.menuItem.category.name,
    })),
  };

  const formattedDishes = allMenuItems.map((m) => ({
    id: m.id,
    name: m.name,
    slug: m.slug,
    price: Number(m.price.toString()),
    imageUrl: m.imageUrl,
    categoryName: m.category.name,
  }));

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <WeeklyMenuAdminClient
        initialWeeklyMenu={formattedWeeklyMenu}
        allDishes={formattedDishes}
      />
    </div>
  );
}
