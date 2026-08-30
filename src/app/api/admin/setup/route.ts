import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = (body.name || process.env.ADMIN_NAME)?.trim();
    const email = (body.email || process.env.ADMIN_EMAIL)?.trim()?.toLowerCase();
    const password = body.password || process.env.ADMIN_PASSWORD;

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error:
            "Missing admin creation parameters. Provide name, email, and password in body or set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD environment variables.",
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

    const passwordHash = await hash(password, 12);
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, passwordHash, role: "ADMIN", isActive: true },
      create: { name, email, passwordHash, role: "ADMIN", isActive: true },
    });

    return NextResponse.json({
      success: true,
      message: `Admin account provisioned successfully for ${user.email}`,
    });
  } catch (error) {
    console.error("Admin setup endpoint error:", error);
    return NextResponse.json(
      { error: "Failed to setup admin user" },
      { status: 500 }
    );
  }
}
