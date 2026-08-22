import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();
const name = process.env.ADMIN_NAME?.trim();
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!name || !email || !password || password.length < 12) {
  console.error("Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD (at least 12 characters). ");
  process.exitCode = 1;
} else {
  await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash: await hash(password, 12), role: "ADMIN", isActive: true },
    create: { name, email, passwordHash: await hash(password, 12), role: "ADMIN" },
  });
  console.log(`Admin account provisioned for ${email}.`);
}

await prisma.$disconnect();
