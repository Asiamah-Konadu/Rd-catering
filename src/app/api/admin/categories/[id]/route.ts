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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireApiRole(["ADMIN", "MENU_MANAGER"]);
  if (response) return response;

  const { id } = await params;

  try {
    const body = await req.json();
    const { name, description, imageUrl, isActive, sortOrder } = body;

    const data: Record<string, unknown> = {};

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        return NextResponse.json(
          { error: "Category name is required" },
          { status: 400 }
        );
      }

      let slug = generateSlug(trimmedName);
      if (!slug) {
        return NextResponse.json(
          { error: "Category name must include letters or numbers" },
          { status: 400 }
        );
      }

      const existing = await prisma.category.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existing) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      data.name = trimmedName;
      data.slug = slug;
    }

    if (description !== undefined) data.description = description || null;
    if (imageUrl !== undefined) data.imageUrl = imageUrl || null;
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (sortOrder !== undefined) {
      data.sortOrder = sortOrder === "" ? 0 : Number(sortOrder);
    }

    const category = await prisma.category.update({
      where: { id },
      data,
      include: {
        _count: { select: { menuItems: true } },
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Failed to update category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireApiRole(["ADMIN", "MENU_MANAGER"]);
  if (response) return response;

  const { id } = await params;

  try {
    const relatedItems = await prisma.menuItem.count({ where: { categoryId: id } });
    if (relatedItems > 0) {
      return NextResponse.json(
        { error: "Move or delete dishes in this category first" },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
