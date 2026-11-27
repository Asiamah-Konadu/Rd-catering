import { hash } from "bcryptjs";
import { createPrisma, loadLocalEnv } from "./prisma-d1.mjs";

loadLocalEnv();

const name = process.env.ADMIN_NAME?.trim();
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!name || !email || !password || password === "[SENSITIVE]") {
  console.log(
    "Admin auto-provisioning skipped: ADMIN_NAME, ADMIN_EMAIL, or ADMIN_PASSWORD not set or sensitive placeholder."
  );
  process.exit(0);
}

if (password.length < 12) {
  console.error("ADMIN_PASSWORD must be at least 12 characters.");
  process.exit(1);
}

const prisma = createPrisma();

try {
  const passwordHash = await hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: "ADMIN", isActive: true },
    create: { name, email, passwordHash, role: "ADMIN", isActive: true },
  });
  console.log(`Admin account provisioned for ${email}.`);
} catch (err) {
  console.error("Failed to provision admin account:", err);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
