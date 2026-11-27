import { hash } from "bcryptjs";
import { createPrisma, loadLocalEnv } from "./prisma-d1.mjs";

loadLocalEnv();

const name = (process.env.STAFF_NAME || process.env.ADMIN_NAME || "Menu Manager")?.trim();
const email = (process.env.STAFF_EMAIL || process.env.ADMIN_EMAIL)?.trim().toLowerCase();
const password = process.env.STAFF_PASSWORD || process.env.ADMIN_PASSWORD;
const rawRole = (process.env.STAFF_ROLE || "MENU_MANAGER").trim().toUpperCase();

const VALID_ROLES = ["ADMIN", "MENU_MANAGER", "ORDER_HANDLER", "DELIVERY_AGENT"];

if (!VALID_ROLES.includes(rawRole)) {
  console.error(`Invalid STAFF_ROLE: "${rawRole}". Must be one of: ${VALID_ROLES.join(", ")}`);
  process.exit(1);
}

if (!name || !email || !password || password === "[SENSITIVE]") {
  console.error("Please set STAFF_NAME, STAFF_EMAIL, and STAFF_PASSWORD (at least 12 characters).");
  console.error("Example usage:");
  console.error(
    'STAFF_NAME="Menu Manager" STAFF_EMAIL="menu@rdcatering.com" STAFF_PASSWORD="your-strong-password" STAFF_ROLE="MENU_MANAGER" npm run staff:create'
  );
  process.exit(1);
}

if (password.length < 12) {
  console.error("STAFF_PASSWORD must be at least 12 characters long.");
  process.exit(1);
}

const prisma = createPrisma();
const role = rawRole;

try {
  const passwordHash = await hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role, isActive: true },
    create: { name, email, passwordHash, role, isActive: true },
  });
  console.log(`Provisioned staff account (${user.role}) for ${user.email}.`);
} catch (err) {
  console.error("Failed to provision staff account:", err);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
