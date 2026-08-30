import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();
const name = process.env.ADMIN_NAME?.trim();
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!name || !email || !password) {
  console.log("Admin auto-provisioning skipped: ADMIN_NAME, ADMIN_EMAIL, or ADMIN_PASSWORD not set.");
} else if (password.length < 12) {
  console.error("ADMIN_PASSWORD must be at least 12 characters.");
  process.exitCode = 1;
} else {
  try {
    const passwordHash = await hash(password, 12);
    await prisma.user.upsert({
      where: { email },
      update: { name, passwordHash, role: "ADMIN", isActive: true },
      create: { name, email, passwordHash, role: "ADMIN", isActive: true },
    });
    console.log(`✓ Admin account provisioned for ${email}.`);
  } catch (err) {
    console.error("Failed to provision admin account:", err);
    process.exitCode = 1;
  }
}

await prisma.$disconnect();
