import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/authz";

// GET /api/admin/weekly-menu
// Returns the currently active/latest weekly menu and all catalog menu items
export async function GET() {
  const { user, response } = await requireApiRole(["ADMIN", "MENU_MANAGER"]);
  if (response || !user) return response;

  try {
    // Find the latest weekly menu or create a default current week menu if none exists
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
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday
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

    // Get all available menu items for the picker
    const allMenuItems = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      orderBy: { name: "asc" },
      include: {
        category: { select: { name: true, slug: true } },
      },
    });

    return NextResponse.json({
      weeklyMenu: {
        id: weeklyMenu.id,
        title: weeklyMenu.title || "This Week's Featured Dishes",
        isPublished: weeklyMenu.isPublished,
        weekStart: weeklyMenu.weekStart,
        weekEnd: weeklyMenu.weekEnd,
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
      },
      availableDishes: allMenuItems.map((m) => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        price: Number(m.price.toString()),
        imageUrl: m.imageUrl,
        categoryName: m.category.name,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch weekly menu admin data:", error);
    return NextResponse.json(
      { error: "Failed to fetch weekly menu data" },
      { status: 500 }
    );
  }
}

// POST /api/admin/weekly-menu
// Save weekly menu items selection and publish toggle
export async function POST(req: Request) {
  const { user, response } = await requireApiRole(["ADMIN", "MENU_MANAGER"]);
  if (response || !user) return response;

  try {
    const body = await req.json();
    const { id, title, isPublished, itemIds } = body as {
      id?: string;
      title?: string;
      isPublished?: boolean;
      itemIds: string[]; // Ordered list of menuItem IDs
    };

    let weeklyMenuId = id;

    if (!weeklyMenuId) {
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const created = await prisma.weeklyMenu.create({
        data: {
          title: title || "This Week's Featured Dishes",
          isPublished: isPublished ?? true,
          weekStart,
          weekEnd,
        },
      });
      weeklyMenuId = created.id;
    } else {
      await prisma.weeklyMenu.update({
        where: { id: weeklyMenuId },
        data: {
          title: title || "This Week's Featured Dishes",
          isPublished: isPublished ?? true,
        },
      });
    }

    // Replace weekly menu items with new order
    await prisma.$transaction(async (tx) => {
      await tx.weeklyMenuItem.deleteMany({
        where: { weeklyMenuId },
      });

      if (Array.isArray(itemIds) && itemIds.length > 0) {
        await tx.weeklyMenuItem.createMany({
          data: itemIds.map((menuItemId, index) => ({
            weeklyMenuId,
            menuItemId,
            sortOrder: index,
          })),
        });
      }
    });

    return NextResponse.json({ success: true, weeklyMenuId });
  } catch (error) {
    console.error("Failed to update weekly menu:", error);
    return NextResponse.json(
      { error: "Failed to update weekly menu" },
      { status: 500 }
    );
  }
}
