import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/authz";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireApiRole(["ADMIN", "MENU_MANAGER"]);
  if (response || !user) return response;

  const { id } = await params;

  try {
    const body = await req.json();
    const updateData: { name?: string; price?: number; isActive?: boolean } = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (name.length < 2) {
        return NextResponse.json(
          { error: "Name must be at least 2 characters long." },
          { status: 400 }
        );
      }
      updateData.name = name;
    }

    if (body.price !== undefined) {
      const price = typeof body.price === "number" ? body.price : parseFloat(body.price);
      if (isNaN(price) || price < 0) {
        return NextResponse.json(
          { error: "Price must be a valid positive number." },
          { status: 400 }
        );
      }
      updateData.price = price;
    }

    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive);
    }

    const updated = await prisma.extra.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      price: Number(updated.price),
      isActive: updated.isActive,
    });
  } catch (error) {
    console.error("Failed to update extra:", error);
    return NextResponse.json(
      { error: "Failed to update extra" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireApiRole(["ADMIN", "MENU_MANAGER"]);
  if (response || !user) return response;

  const { id } = await params;

  try {
    // If it has order history, deactivate it instead of breaking relational integrity
    const existing = await prisma.extra.findUnique({
      where: { id },
      include: { _count: { select: { orderExtras: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Extra not found" }, { status: 404 });
    }

    if (existing._count.orderExtras > 0) {
      await prisma.extra.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        message: "Extra has order history, so it has been deactivated instead of deleted.",
        deactivated: true,
      });
    }

    await prisma.extra.delete({ where: { id } });
    return NextResponse.json({ message: "Extra deleted successfully." });
  } catch (error) {
    console.error("Failed to delete extra:", error);
    return NextResponse.json(
      { error: "Failed to delete extra" },
      { status: 500 }
    );
  }
}
