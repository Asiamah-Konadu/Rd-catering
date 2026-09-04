import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

if (process.env.DATABASE_POSTGRES_URL && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_POSTGRES_URL;
}

try {
  console.log("Running prisma db push...");
  execSync("npx prisma db push", { stdio: "inherit", env: process.env });
  console.log("Running prisma generate...");
  execSync("npx prisma generate", { stdio: "inherit", env: process.env });
  console.log("Database schema synced and Prisma client generated successfully!");
} catch (err) {
  console.error("Failed:", err);
  process.exit(1);
}
