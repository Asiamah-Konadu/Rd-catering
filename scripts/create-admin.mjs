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

const prisma = new PrismaClient();
const name = process.env.ADMIN_NAME?.trim();
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!name || !email || !password || password === "[SENSITIVE]") {
  console.log(
    "Admin auto-provisioning skipped: ADMIN_NAME, ADMIN_EMAIL, or ADMIN_PASSWORD not set or sensitive placeholder."
  );
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
