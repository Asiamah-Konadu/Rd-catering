import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_EXTRAS = [
  { name: "Charcoal Grilled Chicken", price: 20.0 },
  { name: "Crispy Fried Fish", price: 25.0 },
  { name: "Crispy Yam Balls", price: 15.0 },
  { name: "Fresh Ghanaian Salad", price: 15.0 },
  { name: "Kelewele / Fried Plantain", price: 12.0 },
  { name: "Boiled Farm Egg (Kosua)", price: 8.0 },
];

async function main() {
  console.log("Seeding default combo extras...");

  for (const extra of DEFAULT_EXTRAS) {
    const existing = await prisma.extra.findFirst({
      where: { name: extra.name },
    });

    if (existing) {
      console.log(`- '${extra.name}' already exists (GH₵ ${existing.price})`);
    } else {
      const created = await prisma.extra.create({
        data: {
          name: extra.name,
          price: extra.price,
          isActive: true,
        },
      });
      console.log(`+ Created '${created.name}' at GH₵ ${created.price}`);
    }
  }

  console.log("Extras seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
