import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/authz";

// GET /api/admin/hero-promo - Fetch current promo configuration and available menu items
export async function GET() {
  const { user, response } = await requireApiRole(["ADMIN", "MENU_MANAGER"]);
  if (response || !user) return response;

  try {
    const promo = await prisma.heroPromo.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    const menuItems = await prisma.menuItem.findMany({
      where: { isAvailable: true, imageUrl: { not: null } },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        price: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      promo: promo
        ? {
            id: promo.id,
            title: promo.title,
            subtitle: promo.subtitle || "Holiday Special",
            badgeText: promo.badgeText || "SPECIAL / GH",
            imageUrl: promo.imageUrl,
            description: promo.description,
            price: promo.price ? Number(promo.price) : null,
            linkUrl: promo.linkUrl || "/menu",
            isActive: promo.isActive,
            updatedAt: promo.updatedAt,
          }
        : null,
      menuItems: menuItems.map((m) => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        imageUrl: m.imageUrl,
        price: Number(m.price),
      })),
    });
  } catch (error) {
    console.error("Failed to fetch hero promo admin data:", error);
    return NextResponse.json(
      { error: "Failed to retrieve hero promo data" },
      { status: 500 }
    );
  }
}

// POST /api/admin/hero-promo - Save or update hero promo configuration
export async function POST(req: Request) {
  const { user, response } = await requireApiRole(["ADMIN", "MENU_MANAGER"]);
  if (response || !user) return response;

  try {
    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
    const subtitle = typeof body.subtitle === "string" ? body.subtitle.trim() : "Holiday Special";
    const badgeText = typeof body.badgeText === "string" ? body.badgeText.trim() : "SPECIAL / GH";
    const description = typeof body.description === "string" ? body.description.trim() : null;
    const linkUrl = typeof body.linkUrl === "string" ? body.linkUrl.trim() : "/menu";
    const isActive = Boolean(body.isActive);
    const price = body.price !== undefined && body.price !== null && body.price !== ""
      ? parseFloat(body.price)
      : null;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required for the combo special advertisement." },
        { status: 400 }
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required for the combo special advertisement." },
        { status: 400 }
      );
    }

    // Check if an existing record exists
    const existing = await prisma.heroPromo.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    let savedPromo;
    if (existing) {
      savedPromo = await prisma.heroPromo.update({
        where: { id: existing.id },
        data: {
          title,
          imageUrl,
          subtitle: subtitle || "Holiday Special",
          badgeText: badgeText || "SPECIAL / GH",
          description: description || null,
          linkUrl: linkUrl || "/menu",
          price: price !== null && !isNaN(price) ? price : null,
          isActive,
        },
      });
    } else {
      savedPromo = await prisma.heroPromo.create({
        data: {
          title,
          imageUrl,
          subtitle: subtitle || "Holiday Special",
          badgeText: badgeText || "SPECIAL / GH",
          description: description || null,
          linkUrl: linkUrl || "/menu",
          price: price !== null && !isNaN(price) ? price : null,
          isActive,
        },
      });
    }

    return NextResponse.json({
      success: true,
      promo: {
        id: savedPromo.id,
        title: savedPromo.title,
        subtitle: savedPromo.subtitle,
        badgeText: savedPromo.badgeText,
        imageUrl: savedPromo.imageUrl,
        description: savedPromo.description,
        price: savedPromo.price ? Number(savedPromo.price) : null,
        linkUrl: savedPromo.linkUrl,
        isActive: savedPromo.isActive,
      },
    });
  } catch (error) {
    console.error("Failed to save hero promo:", error);
    return NextResponse.json(
      { error: "Failed to save hero promo advertisement" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/hero-promo - Quick toggle active/inactive status
export async function PATCH(req: Request) {
  const { user, response } = await requireApiRole(["ADMIN", "MENU_MANAGER"]);
  if (response || !user) return response;

  try {
    const body = await req.json();
    const existing = await prisma.heroPromo.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "No hero promo found to toggle. Please create one first." },
        { status: 404 }
      );
    }

    const updated = await prisma.heroPromo.update({
      where: { id: existing.id },
      data: {
        isActive: typeof body.isActive === "boolean" ? body.isActive : !existing.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      isActive: updated.isActive,
    });
  } catch (error) {
    console.error("Failed to toggle hero promo status:", error);
    return NextResponse.json(
      { error: "Failed to toggle advertising status" },
      { status: 500 }
    );
  }
}
