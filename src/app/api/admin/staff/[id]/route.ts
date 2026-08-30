import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/authz";
import { hash } from "bcryptjs";
import { STAFF_ROLES } from "@/auth";
import type { UserRole } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireApiRole(["ADMIN"]);
  if (response) return response;

  try {
    const { id } = await params;
    const body = await req.json();

    const existingStaff = await prisma.user.findUnique({ where: { id } });
    if (!existingStaff || !STAFF_ROLES.includes(existingStaff.role)) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    const updateData: {
      role?: UserRole;
      isActive?: boolean;
      name?: string;
      phone?: string | null;
      passwordHash?: string;
    } = {};

    if (body.role !== undefined) {
      const roleInput = String(body.role).trim().toUpperCase() as UserRole;
      if (!STAFF_ROLES.includes(roleInput)) {
        return NextResponse.json(
          { error: `Invalid role. Must be one of: ${STAFF_ROLES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.role = roleInput;
    }

    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive);
    }

    if (body.name !== undefined) {
      updateData.name = String(body.name).trim();
    }

    if (body.phone !== undefined) {
      updateData.phone = body.phone ? String(body.phone).trim() : null;
    }

    if (body.password) {
      if (String(body.password).length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters long." },
          { status: 400 }
        );
      }
      updateData.passwordHash = await hash(String(body.password), 12);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/admin/staff/[id] error:", error);
    return NextResponse.json({ error: "Failed to update staff account" }, { status: 500 });
  }
}
