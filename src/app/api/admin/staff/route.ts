import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/authz";
import { hash } from "bcryptjs";
import { STAFF_ROLES } from "@/auth";
import type { UserRole } from "@prisma/client";

// GET /api/admin/staff - List all staff accounts (ADMIN only)
export async function GET() {
  const { response } = await requireApiRole(["ADMIN"]);
  if (response) return response;

  try {
    const staff = await prisma.user.findMany({
      where: { role: { in: STAFF_ROLES } },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("GET /api/admin/staff error:", error);
    return NextResponse.json({ error: "Failed to fetch staff accounts" }, { status: 500 });
  }
}

// POST /api/admin/staff - Create new staff account (ADMIN only)
export async function POST(req: Request) {
  const { response } = await requireApiRole(["ADMIN"]);
  if (response) return response;

  try {
    const body = await req.json();
    const name = body.name?.trim();
    const email = body.email?.trim()?.toLowerCase();
    const password = body.password;
    const roleInput = body.role?.trim()?.toUpperCase() as UserRole;
    const phone = body.phone?.trim() || null;

    if (!name || !email || !password || !roleInput) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (!STAFF_ROLES.includes(roleInput)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${STAFF_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email address already exists." },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, 12);
    const newStaff = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: roleInput,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newStaff, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/staff error:", error);
    return NextResponse.json({ error: "Failed to create staff account" }, { status: 500 });
  }
}
