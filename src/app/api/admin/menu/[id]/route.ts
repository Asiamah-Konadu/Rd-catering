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
    const { name, categoryId, description, imageUrl, price, isAvailable, isFeatured } = body;

    const data: Record<string, any> = {};

    if (name !== undefined) {
      data.name = name;
      let newSlug = generateSlug(name);
      const existing = await prisma.menuItem.findFirst({
        where: { slug: newSlug, NOT: { id } },
      });
      if (existing) {
        newSlug = `${newSlug}-${Date.now().toString(36)}`;
      }
      data.slug = newSlug;
    }
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (description !== undefined) data.description = description;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (price !== undefined) data.price = parseFloat(price);
    if (isAvailable !== undefined) data.isAvailable = Boolean(isAvailable);
    if (isFeatured !== undefined) data.isFeatured = Boolean(isFeatured);

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data,
      include: { category: true },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Failed to update menu item:", error);
    return NextResponse.json(
      { error: "Failed to update menu item" },
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
    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Failed to delete menu item:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
