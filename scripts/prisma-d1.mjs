import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

export const D1_DATABASE_ID = "bb14fdbd-e3cb-4b9a-8a63-9582b486121b";

export function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx <= 0) continue;
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

export function loadLocalEnv() {
  loadEnvFile(path.resolve(process.cwd(), ".env.local"));
  loadEnvFile(path.resolve(process.cwd(), ".env"));
  loadEnvFile(path.resolve(process.cwd(), ".dev.vars"));
}

export function createPrisma() {
  loadLocalEnv();

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_DATABASE_ID || D1_DATABASE_ID;
  const token = process.env.CLOUDFLARE_D1_TOKEN || process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !token) {
    throw new Error(
      "Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_D1_TOKEN (or CLOUDFLARE_API_TOKEN) to talk to D1 from Node scripts."
    );
  }

  return new PrismaClient({
    adapter: new PrismaD1({
      CLOUDFLARE_ACCOUNT_ID: accountId,
      CLOUDFLARE_DATABASE_ID: databaseId,
      CLOUDFLARE_D1_TOKEN: token
    })
  });
}
