import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import fs from "fs";
import path from "path";

function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (!process.env[key] && val && val !== "[SENSITIVE]") {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"));
loadEnvFile(path.resolve(process.cwd(), ".env"));

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!dbUrl || dbUrl === "[SENSITIVE]") {
  console.error("❌ DATABASE_URL or DIRECT_URL is not set locally in your .env.local file.");
  console.error("Vercel CLI replaces secret connection strings with '[SENSITIVE]' for security.\n");
  console.error("To fix this:");
  console.error("1. Copy your actual DATABASE_URL from Vercel Dashboard -> Settings -> Environment Variables");
  console.error("2. Paste it into your local .env.local file as DATABASE_URL=\"postgresql://...\"");
  console.error("   OR trigger creation directly on your deployed site via /api/admin/setup\n");
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: { url: dbUrl },
  },
});

const name = (process.env.STAFF_NAME || process.env.ADMIN_NAME || "Menu Manager")?.trim();
const email = (process.env.STAFF_EMAIL || process.env.ADMIN_EMAIL)?.trim().toLowerCase();
const password = process.env.STAFF_PASSWORD || process.env.ADMIN_PASSWORD;
const rawRole = (process.env.STAFF_ROLE || "MENU_MANAGER").trim().toUpperCase();

const VALID_ROLES = ["ADMIN", "MENU_MANAGER", "ORDER_HANDLER", "DELIVERY_AGENT"];

if (!VALID_ROLES.includes(rawRole)) {
  console.error(`Invalid STAFF_ROLE: "${rawRole}". Must be one of: ${VALID_ROLES.join(", ")}`);
  process.exitCode = 1;
  await prisma.$disconnect();
  process.exit(1);
}

const role = rawRole;

if (!name || !email || !password || password === "[SENSITIVE]") {
  console.error("Please set STAFF_NAME, STAFF_EMAIL, and STAFF_PASSWORD (at least 12 characters).");
  console.error("Example usage:");
  console.error('STAFF_NAME="Menu Manager" STAFF_EMAIL="menu@rdcatering.com" STAFF_PASSWORD="your-strong-password" STAFF_ROLE="MENU_MANAGER" npm run staff:create');
  process.exitCode = 1;
} else if (password.length < 12) {
  console.error("STAFF_PASSWORD must be at least 12 characters long.");
  process.exitCode = 1;
} else {
  try {
    const passwordHash = await hash(password, 12);
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, passwordHash, role, isActive: true },
      create: { name, email, passwordHash, role, isActive: true },
    });
    console.log(`✓ Provisioned staff account (${user.role}) for ${user.email}.`);
  } catch (err) {
    console.error("Failed to provision staff account:", err);
    process.exitCode = 1;
  }
}

await prisma.$disconnect();
