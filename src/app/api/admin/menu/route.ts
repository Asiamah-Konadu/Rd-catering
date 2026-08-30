import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/authz";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const { response } = await requireApiRole(["ADMIN", "MENU_MANAGER"]);
  if (response) return response;

  try {
    const menuItems = await prisma.menuItem.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("Failed to fetch menu items:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { response } = await requireApiRole(["ADMIN", "MENU_MANAGER"]);
  if (response) return response;

  try {
    const body = await req.json();
    const { name, categoryId, description, imageUrl, price, isAvailable, isFeatured } = body;

    if (!name || !categoryId || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields (name, categoryId, price)" },
        { status: 400 }
      );
    }

    let slug = generateSlug(name);
    const existing = await prisma.menuItem.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const newItem = await prisma.menuItem.create({
      data: {
        name,
        slug,
        categoryId,
        description: description || null,
        imageUrl: imageUrl || null,
        price: parseFloat(price),
        isAvailable: isAvailable ?? true,
        isFeatured: isFeatured ?? false,
      },
      include: { category: true },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Failed to create menu item:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}
