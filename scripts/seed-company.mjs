import { PrismaClient } from "@prisma/client";
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
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

const validPostgresUrl = [
  process.env.DATABASE_URL_UNPOOLED,
  process.env.DATABASE_POSTGRES_URL,
  process.env.DIRECT_URL,
  process.env.DATABASE_URL,
].find((url) => url && (url.startsWith("postgresql://") || url.startsWith("postgres://")));

if (validPostgresUrl) {
  process.env.DATABASE_URL = validPostgresUrl;
}

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.company.count();
  console.log("Current company count:", count);

  if (count === 0) {
    const demo = await prisma.company.create({
      data: {
        name: "Stanbic Bank Ghana (Airport City HQ)",
        slug: "stanbic-bank",
        address: "Stanbic Heights, Intersection of Liberation & Airport Bypass",
        city: "Accra",
        region: "Greater Accra",
        dropoffLocation: "Front Desk / Security Reception, Ground Floor",
        contactPersonName: "HR & Wellness Team",
        contactPhone: "0302815700",
        contactEmail: "hr-wellness@stanbic.com.gh",
        cutoffTime: "10:30 AM",
        batchDeliveryTime: "12:30 PM",
        discountPercent: 10,
        freeDelivery: true,
        customPackaging: true,
        notes: "Notify front desk security upon arrival.",
        isActive: true,
      },
    });
    console.log("Created demo company:", demo.name, "(slug: " + demo.slug + ")");
  } else {
    const list = await prisma.company.findMany({ select: { name: true, slug: true } });
    console.log("Existing companies:", list);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
