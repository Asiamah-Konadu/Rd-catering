import fs from "fs";
import path from "path";

const MENU_DATA = [
  {
    category: {
      id: "cat_soups_swallows",
      name: "soups and Swallows/local;s",
      slug: "soups-and-swallows-locals",
      description: "Authentic Ghanaian soups and swallows",
      imageUrl: "https://i.pinimg.com/736x/f9/cd/bc/f9cdbc877fcf6c975e1831e07dbc4820.jpg",
      sortOrder: 1,
    },
    items: [
      {
        id: "item_fufu_light_soup",
        name: "fufu and Light soup",
        slug: "fufu-and-light-soup",
        price: 95.0,
        imageUrl: "https://i.pinimg.com/736x/f9/cd/bc/f9cdbc877fcf6c975e1831e07dbc4820.jpg",
        description: "Soft pounded Ghanaian fufu served with rich aromatic light soup.",
        isFeatured: 1,
      },
      {
        id: "item_kenkey_fried_fish",
        name: "kenkey and fried fish",
        slug: "kenkey-and-fried-fish",
        price: 50.0,
        imageUrl: "https://i.pinimg.com/736x/e6/58/8c/e6588cef1fd57e7381ddc87710dc549d.jpg",
        description: "Hot steamed Ga kenkey served with seasoned fried fish, spicy pepper, and shito.",
        isFeatured: 1,
      },
      {
        id: "item_ampesi_palava_sauce",
        name: "Ampesi and Palava Sauce",
        slug: "ampesi-and-palava-sauce",
        price: 50.0,
        imageUrl: "https://i.pinimg.com/736x/73/e1/25/73e125e74ab2729fd8872a26c1e3ffbc.jpg",
        description: "Boiled plantain or yam paired with rich palava sauce.",
        isFeatured: 0,
      },
    ],
  },
  {
    category: {
      id: "cat_rice_dishes",
      name: "Rice Dishes",
      slug: "rice-dishes",
      description: "Aromatic Ghanaian rice dishes",
      imageUrl: "https://i.pinimg.com/736x/ba/a8/30/baa830bbfe09807d2966f080ba6117a0.jpg",
      sortOrder: 2,
    },
    items: [
      {
        id: "item_vermicelli_rice_kentucky",
        name: "vermicelli Rice and Kentucky",
        slug: "vermicelli-rice-and-kentucky",
        price: 55.0,
        imageUrl: "https://i.pinimg.com/736x/3b/e9/57/3be957cf44601b12f9ecd8ba7537e76b.jpg",
        description: "Fragrant vermicelli rice served with crispy Kentucky-style chicken.",
        isFeatured: 0,
      },
      {
        id: "item_vermicelli_rice_fried_fish",
        name: "Vermicelli rice and Fried fish",
        slug: "vermicelli-rice-and-fried-fish",
        price: 55.0,
        imageUrl: "https://i.pinimg.com/736x/a1/20/c7/a120c716081efb32e3a185ba7e5ff2b9.jpg",
        description: "Fragrant vermicelli rice paired with crispy fried fish.",
        isFeatured: 0,
      },
      {
        id: "item_jollof_grilled_chicken",
        name: "Jollof rice and Grilled Chicked",
        slug: "jollof-rice-and-grilled-chicked",
        price: 75.0,
        imageUrl: "https://i.pinimg.com/736x/ba/a8/30/baa830bbfe09807d2966f080ba6117a0.jpg",
        description: "Signature smoky Ghanaian party jollof rice with grilled chicken.",
        isFeatured: 1,
      },
      {
        id: "item_fried_rice_grilled_chicken",
        name: "Fried rice and Grilled chicken",
        slug: "fried-rice-and-grilled-chicken",
        price: 75.0,
        imageUrl: "https://i.pinimg.com/736x/3f/0c/3f/3f0c3f59228e46e7f75d581d63b76e75.jpg",
        description: "Savory vegetable fried rice served with tender grilled chicken.",
        isFeatured: 1,
      },
    ],
  },
  {
    category: {
      id: "cat_salads_addons",
      name: "salads/Add ons",
      slug: "salads-add-ons",
      description: "Salads and sides",
      imageUrl: "https://i.pinimg.com/736x/13/5b/23/135b233a1a7cbdab186d71a6ad4a0a00.jpg",
      sortOrder: 3,
    },
    items: [
      {
        id: "item_ghanaian_salad",
        name: "Ghanaian salad",
        slug: "ghanaian-salad",
        price: 25.0,
        imageUrl: "https://i.pinimg.com/736x/13/5b/23/135b233a1a7cbdab186d71a6ad4a0a00.jpg",
        description: "Classic Ghanaian salad with cabbage, eggs, baked beans, and creamy dressing.",
        isFeatured: 0,
      },
      {
        id: "item_kosua_ne_mako",
        name: "Kosua ne Mako",
        slug: "kosua-ne-mako",
        price: 25.0,
        imageUrl: "https://i.pinimg.com/736x/f5/74/54/f5745471033bf8cf6f6f9e5b35fe1b25.jpg",
        description: "Fresh boiled eggs served with freshly ground Ghanaian pepper salsa (mako).",
        isFeatured: 0,
      },
    ],
  },
  {
    category: {
      id: "cat_combo_package",
      name: "Combo Package",
      slug: "combo-package",
      description: "Generous combo packages and sharing platters",
      imageUrl: "https://i.pinimg.com/736x/35/b9/18/35b9185c7613b4a0b4972349dba2e6bf.jpg",
      sortOrder: 4,
    },
    items: [
      {
        id: "item_waakye_jollof_combo",
        name: "Waakye, Jollof, Fried fish, Kentucky, Ghanaian salad, Shito",
        slug: "waakye-jollof-fried-fish-kentucky-ghanaian-salad-shito",
        price: 220.0,
        imageUrl: "https://i.pinimg.com/736x/35/b9/18/35b9185c7613b4a0b4972349dba2e6bf.jpg",
        description: "Platter featuring Waakye, Jollof, Fried fish, Kentucky, Ghanaian salad, and Shito.",
        isFeatured: 1,
      },
    ],
  },
];

function escapeSql(str) {
  if (typeof str !== "string") return "NULL";
  return "'" + str.replace(/'/g, "''") + "'";
}

const now = new Date().toISOString();
const sqlStatements = [];

for (const group of MENU_DATA) {
  const cat = group.category;
  sqlStatements.push(`
INSERT INTO Category (id, name, slug, description, imageUrl, sortOrder, isActive, createdAt, updatedAt)
VALUES (${escapeSql(cat.id)}, ${escapeSql(cat.name)}, ${escapeSql(cat.slug)}, ${escapeSql(cat.description)}, ${escapeSql(cat.imageUrl)}, ${cat.sortOrder}, 1, ${escapeSql(now)}, ${escapeSql(now)})
ON CONFLICT(slug) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  imageUrl = excluded.imageUrl,
  sortOrder = excluded.sortOrder,
  isActive = 1,
  updatedAt = excluded.updatedAt;
`);

  for (const item of group.items) {
    sqlStatements.push(`
INSERT INTO MenuItem (id, name, slug, description, price, imageUrl, isAvailable, isFeatured, categoryId, createdAt, updatedAt)
VALUES (
  ${escapeSql(item.id)},
  ${escapeSql(item.name)},
  ${escapeSql(item.slug)},
  ${escapeSql(item.description)},
  ${item.price},
  ${escapeSql(item.imageUrl)},
  1,
  ${item.isFeatured},
  (SELECT id FROM Category WHERE slug = ${escapeSql(cat.slug)}),
  ${escapeSql(now)},
  ${escapeSql(now)}
)
ON CONFLICT(slug) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  imageUrl = excluded.imageUrl,
  isAvailable = 1,
  isFeatured = excluded.isFeatured,
  categoryId = excluded.categoryId,
  updatedAt = excluded.updatedAt;
`);
  }
}

// Also combo table
sqlStatements.push(`
INSERT INTO Combo (id, name, slug, description, price, imageUrl, isAvailable, createdAt, updatedAt)
VALUES (
  'combo_mega_feast',
  'Waakye, Jollof, Fried fish, Kentucky, Ghanaian salad, Shito',
  'waakye-jollof-fried-fish-kentucky-ghanaian-salad-shito',
  'Platter featuring Waakye, Jollof, Fried fish, Kentucky, Ghanaian salad, and Shito.',
  220.0,
  'https://i.pinimg.com/736x/35/b9/18/35b9185c7613b4a0b4972349dba2e6bf.jpg',
  1,
  ${escapeSql(now)},
  ${escapeSql(now)}
)
ON CONFLICT(slug) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  imageUrl = excluded.imageUrl,
  isAvailable = 1,
  updatedAt = excluded.updatedAt;
`);

const outputPath = path.resolve(process.cwd(), "scripts/seed-data.sql");
fs.writeFileSync(outputPath, sqlStatements.join("\n"));
console.log("Generated scripts/seed-data.sql successfully!");
