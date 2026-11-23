import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

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

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL is not set.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

const MENU_DATA = [
  {
    category: {
      name: "Soups & Swallows",
      slug: "soups-swallows",
      description: "Authentic Ghanaian soups and traditional swallows cooked with fresh, local ingredients.",
      imageUrl: "https://i.pinimg.com/736x/f9/cd/bc/f9cdbc877fcf6c975e1831e07dbc4820.jpg",
      sortOrder: 1,
    },
    items: [
      {
        name: "Fufu and Light Soup",
        slug: "fufu-and-light-soup",
        price: 95.0,
        imageUrl: "https://i.pinimg.com/736x/f9/cd/bc/f9cdbc877fcf6c975e1831e07dbc4820.jpg",
        description: "Soft pounded Ghanaian fufu served in a rich, aromatic and spicy goat/meat light soup.",
        isFeatured: true,
      },
      {
        name: "Kenkey and Fried Fish",
        slug: "kenkey-and-fried-fish",
        price: 50.0,
        imageUrl: "https://i.pinimg.com/736x/e6/58/8c/e6588cef1fd57e7381ddc87710dc549d.jpg",
        description: "Hot steamed Ga kenkey served with seasoned, crispy fried fish, spicy raw red & green pepper, and savory shito.",
        isFeatured: true,
      },
      {
        name: "Ampesi and Palava Sauce",
        slug: "ampesi-and-palava-sauce",
        price: 50.0,
        imageUrl: "https://i.pinimg.com/736x/73/e1/25/73e125e74ab2729fd8872a26c1e3ffbc.jpg",
        description: "Tender boiled plantain or yam paired with rich, savory Ghanaian spinach and egusi (agushie) palava sauce with fish and egg.",
        isFeatured: false,
      },
    ],
  },
  {
    category: {
      name: "Rice Dishes",
      slug: "rice-dishes",
      description: "Flavor-packed Ghanaian jollof, fried rice, and aromatic vermicelli rice specialties.",
      imageUrl: "https://i.pinimg.com/736x/ba/a8/30/baa830bbfe09807d2966f080ba6117a0.jpg",
      sortOrder: 2,
    },
    items: [
      {
        name: "Vermicelli Rice and Kentucky",
        slug: "vermicelli-rice-and-kentucky",
        price: 55.0,
        imageUrl: "https://i.pinimg.com/736x/3b/e9/57/3be957cf44601b12f9ecd8ba7537e76b.jpg",
        description: "Fragrant, golden seasoned vermicelli rice served with crispy golden-fried Kentucky-style chicken.",
        isFeatured: false,
      },
      {
        name: "Vermicelli Rice and Fried Fish",
        slug: "vermicelli-rice-and-fried-fish",
        price: 55.0,
        imageUrl: "https://i.pinimg.com/736x/a1/20/c7/a120c716081efb32e3a185ba7e5ff2b9.jpg",
        description: "Fragrant vermicelli rice paired with seasoned, crispy fried whole fish and rich shito sauce.",
        isFeatured: false,
      },
      {
        name: "Jollof Rice and Grilled Chicken",
        slug: "jollof-rice-and-grilled-chicken",
        price: 75.0,
        imageUrl: "https://i.pinimg.com/736x/ba/a8/30/baa830bbfe09807d2966f080ba6117a0.jpg",
        description: "Our signature smoky Ghanaian party jollof rice paired with succulent charcoal-grilled spiced chicken and salad garnish.",
        isFeatured: true,
      },
      {
        name: "Fried Rice and Grilled Chicken",
        slug: "fried-rice-and-grilled-chicken",
        price: 75.0,
        imageUrl: "https://i.pinimg.com/736x/3f/0c/3f/3f0c3f59228e46e7f75d581d63b76e75.jpg",
        description: "Savory wok-tossed garden vegetable fried rice served with tender, juicy flame-grilled chicken.",
        isFeatured: true,
      },
    ],
  },
  {
    category: {
      name: "Salads & Add-ons",
      slug: "salads-add-ons",
      description: "Crisp salads, Ghanaian sides, and savory appetizers.",
      imageUrl: "https://i.pinimg.com/736x/13/5b/23/135b233a1a7cbdab186d71a6ad4a0a00.jpg",
      sortOrder: 3,
    },
    items: [
      {
        name: "Ghanaian Salad",
        slug: "ghanaian-salad",
        price: 25.0,
        imageUrl: "https://i.pinimg.com/736x/13/5b/23/135b233a1a7cbdab186d71a6ad4a0a00.jpg",
        description: "Classic Ghanaian salad with crisp cabbage, lettuce, carrots, boiled eggs, baked beans, and creamy dressing.",
        isFeatured: false,
      },
      {
        name: "Kosua ne Mako",
        slug: "kosua-ne-mako",
        price: 25.0,
        imageUrl: "https://i.pinimg.com/736x/f5/74/54/f5745471033bf8cf6f6f9e5b35fe1b25.jpg",
        description: "Freshly boiled eggs sliced and packed with hot ground Ghanaian pepper salsa (mako), diced onions, and tomatoes.",
        isFeatured: false,
      },
    ],
  },
  {
    category: {
      name: "Combo Package",
      slug: "combo-package",
      description: "Generous combo packages and sharing platters for events, gatherings, or big appetites.",
      imageUrl: "https://i.pinimg.com/736x/35/b9/18/35b9185c7613b4a0b4972349dba2e6bf.jpg",
      sortOrder: 4,
    },
    items: [
      {
        name: "Rich-Dons Mega Feast Combo",
        slug: "rich-dons-mega-feast-combo",
        price: 220.0,
        imageUrl: "https://i.pinimg.com/736x/35/b9/18/35b9185c7613b4a0b4972349dba2e6bf.jpg",
        description: "The complete celebration platter: Waakye, Smoky Jollof, Crispy Fried Fish, Kentucky Chicken, Ghanaian Salad, and savory Shito.",
        isFeatured: true,
      },
    ],
  },
];

const EXTRAS_DATA = [
  { name: "Ghanaian Salad", price: 25.0 },
  { name: "Kosua ne Mako (2 pcs)", price: 25.0 },
  { name: "Charcoal Grilled Chicken", price: 30.0 },
  { name: "Crispy Fried Fish", price: 25.0 },
  { name: "Kentucky Style Fried Chicken", price: 25.0 },
  { name: "Fried Plantain / Kelewele", price: 15.0 },
  { name: "Extra Shito Jar", price: 10.0 },
];

async function main() {
  console.log("🚀 Starting database seeding for Rich-Dons Catering...\n");

  // 1. Seed Categories & Menu Items
  for (const group of MENU_DATA) {
    const category = await prisma.category.upsert({
      where: { slug: group.category.slug },
      update: {
        name: group.category.name,
        description: group.category.description,
        imageUrl: group.category.imageUrl,
        sortOrder: group.category.sortOrder,
        isActive: true,
      },
      create: {
        name: group.category.name,
        slug: group.category.slug,
        description: group.category.description,
        imageUrl: group.category.imageUrl,
        sortOrder: group.category.sortOrder,
        isActive: true,
      },
    });

    console.log(`📂 Category: ${category.name} (${category.slug})`);

    for (const item of group.items) {
      const menuItem = await prisma.menuItem.upsert({
        where: { slug: item.slug },
        update: {
          name: item.name,
          categoryId: category.id,
          price: item.price,
          imageUrl: item.imageUrl,
          description: item.description,
          isAvailable: true,
          isFeatured: item.isFeatured,
        },
        create: {
          name: item.name,
          slug: item.slug,
          categoryId: category.id,
          price: item.price,
          imageUrl: item.imageUrl,
          description: item.description,
          isAvailable: true,
          isFeatured: item.isFeatured,
        },
      });

      console.log(`   🍽️  Dish: ${menuItem.name} - GH₵ ${item.price.toFixed(2)} [${menuItem.slug}]`);
    }
    console.log("");
  }

  // 2. Also register the Combo in Combo model
  const megaCombo = await prisma.combo.upsert({
    where: { slug: "rich-dons-mega-feast-combo" },
    update: {
      name: "Rich-Dons Mega Feast Combo",
      price: 220.0,
      imageUrl: "https://i.pinimg.com/736x/35/b9/18/35b9185c7613b4a0b4972349dba2e6bf.jpg",
      description: "Waakye, Jollof, Fried fish, Kentucky, Ghanaian salad, Shito combo platter.",
      isAvailable: true,
    },
    create: {
      name: "Rich-Dons Mega Feast Combo",
      slug: "rich-dons-mega-feast-combo",
      price: 220.0,
      imageUrl: "https://i.pinimg.com/736x/35/b9/18/35b9185c7613b4a0b4972349dba2e6bf.jpg",
      description: "Waakye, Jollof, Fried fish, Kentucky, Ghanaian salad, Shito combo platter.",
      isAvailable: true,
    },
  });
  console.log(`⭐ Combo Package: ${megaCombo.name} - GH₵ ${Number(megaCombo.price).toFixed(2)}\n`);

  // 3. Seed Extras
  console.log("🥗 Seeding Extras & Add-ons...");
  for (const extra of EXTRAS_DATA) {
    const existing = await prisma.extra.findFirst({
      where: { name: extra.name },
    });

    if (existing) {
      await prisma.extra.update({
        where: { id: existing.id },
        data: { price: extra.price, isActive: true },
      });
      console.log(`   ✓ Updated Extra: ${extra.name} - GH₵ ${extra.price.toFixed(2)}`);
    } else {
      await prisma.extra.create({
        data: {
          name: extra.name,
          price: extra.price,
          isActive: true,
        },
      });
      console.log(`   + Created Extra: ${extra.name} - GH₵ ${extra.price.toFixed(2)}`);
    }
  }

  console.log("\n✅ Database filled successfully!");
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
