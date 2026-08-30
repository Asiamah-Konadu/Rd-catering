import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import type { UserRole } from "@prisma/client";

const VALID_ROLES = ["ADMIN", "MENU_MANAGER", "ORDER_HANDLER", "DELIVERY_AGENT"];

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = (body.name || process.env.ADMIN_NAME)?.trim();
    const email = (body.email || process.env.ADMIN_EMAIL)?.trim()?.toLowerCase();
    const password = body.password || process.env.ADMIN_PASSWORD;
    const roleInput = (body.role || "ADMIN").trim().toUpperCase();

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error:
            "Missing parameters. Provide name, email, and password in body or environment variables.",
        },
        { status: 400 }
      );
    }

    if (password.length < 12) {
      return NextResponse.json(
        { error: "Password must be at least 12 characters." },
        { status: 400 }
      );
    }

    if (!VALID_ROLES.includes(roleInput)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    const role = roleInput as UserRole;
    const passwordHash = await hash(password, 12);
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, passwordHash, role, isActive: true },
      create: { name, email, passwordHash, role, isActive: true },
    });

    return NextResponse.json({
      success: true,
      message: `Staff account (${user.role}) provisioned successfully for ${user.email}`,
    });
  } catch (error) {
    console.error("Admin setup endpoint error:", error);
    return NextResponse.json(
      { error: "Failed to setup staff user" },
      { status: 500 }
    );
  }
}
