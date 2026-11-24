import { createPrisma } from "./prisma-d1.mjs";

const prisma = createPrisma();

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
