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
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { response } = await requireApiRole(["ADMIN", "MENU_MANAGER"]);
  if (response) return response;

  try {
    const body = await req.json();
    const { name, description, imageUrl, isActive, sortOrder } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { error: "Missing required field (name)" },
        { status: 400 }
      );
    }

    let slug = generateSlug(name);
    if (!slug) {
      return NextResponse.json(
        { error: "Category name must include letters or numbers" },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const category = await prisma.category.create({
      data: {
        name: String(name).trim(),
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        isActive: isActive ?? true,
        sortOrder: sortOrder === "" || sortOrder === undefined ? 0 : Number(sortOrder),
      },
      include: {
        _count: { select: { menuItems: true } },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
