
INSERT INTO Category (id, name, slug, description, imageUrl, sortOrder, isActive, createdAt, updatedAt)
VALUES ('cat_soups_swallows', 'soups and Swallows/local;s', 'soups-and-swallows-locals', 'Authentic Ghanaian soups and swallows', 'https://i.pinimg.com/736x/f9/cd/bc/f9cdbc877fcf6c975e1831e07dbc4820.jpg', 1, 1, '2026-11-24T16:40:33.316Z', '2026-11-24T16:40:33.316Z')
ON CONFLICT(slug) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  imageUrl = excluded.imageUrl,
  sortOrder = excluded.sortOrder,
  isActive = 1,
  updatedAt = excluded.updatedAt;


INSERT INTO MenuItem (id, name, slug, description, price, imageUrl, isAvailable, isFeatured, categoryId, createdAt, updatedAt)
VALUES (
  'item_fufu_light_soup',
  'fufu and Light soup',
  'fufu-and-light-soup',
  'Soft pounded Ghanaian fufu served with rich aromatic light soup.',
  95,
  'https://i.pinimg.com/736x/f9/cd/bc/f9cdbc877fcf6c975e1831e07dbc4820.jpg',
  1,
  1,
  (SELECT id FROM Category WHERE slug = 'soups-and-swallows-locals'),
  '2026-11-24T16:40:33.316Z',
  '2026-11-24T16:40:33.316Z'
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


INSERT INTO MenuItem (id, name, slug, description, price, imageUrl, isAvailable, isFeatured, categoryId, createdAt, updatedAt)
VALUES (
  'item_kenkey_fried_fish',
  'kenkey and fried fish',
  'kenkey-and-fried-fish',
  'Hot steamed Ga kenkey served with seasoned fried fish, spicy pepper, and shito.',
  50,
  'https://i.pinimg.com/736x/e6/58/8c/e6588cef1fd57e7381ddc87710dc549d.jpg',
  1,
  1,
  (SELECT id FROM Category WHERE slug = 'soups-and-swallows-locals'),
  '2026-11-24T16:40:33.316Z',
  '2026-11-24T16:40:33.316Z'
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


INSERT INTO MenuItem (id, name, slug, description, price, imageUrl, isAvailable, isFeatured, categoryId, createdAt, updatedAt)
VALUES (
  'item_ampesi_palava_sauce',
  'Ampesi and Palava Sauce',
  'ampesi-and-palava-sauce',
  'Boiled plantain or yam paired with rich palava sauce.',
  50,
  'https://i.pinimg.com/736x/73/e1/25/73e125e74ab2729fd8872a26c1e3ffbc.jpg',
  1,
  0,
  (SELECT id FROM Category WHERE slug = 'soups-and-swallows-locals'),
  '2026-11-24T16:40:33.316Z',
  '2026-11-24T16:40:33.316Z'
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


INSERT INTO Category (id, name, slug, description, imageUrl, sortOrder, isActive, createdAt, updatedAt)
VALUES ('cat_rice_dishes', 'Rice Dishes', 'rice-dishes', 'Aromatic Ghanaian rice dishes', 'https://i.pinimg.com/736x/ba/a8/30/baa830bbfe09807d2966f080ba6117a0.jpg', 2, 1, '2026-11-24T16:40:33.316Z', '2026-11-24T16:40:33.316Z')
ON CONFLICT(slug) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  imageUrl = excluded.imageUrl,
  sortOrder = excluded.sortOrder,
  isActive = 1,
  updatedAt = excluded.updatedAt;


INSERT INTO MenuItem (id, name, slug, description, price, imageUrl, isAvailable, isFeatured, categoryId, createdAt, updatedAt)
VALUES (
  'item_vermicelli_rice_kentucky',
  'vermicelli Rice and Kentucky',
  'vermicelli-rice-and-kentucky',
  'Fragrant vermicelli rice served with crispy Kentucky-style chicken.',
  55,
  'https://i.pinimg.com/736x/3b/e9/57/3be957cf44601b12f9ecd8ba7537e76b.jpg',
  1,
  0,
  (SELECT id FROM Category WHERE slug = 'rice-dishes'),
  '2026-11-24T16:40:33.316Z',
  '2026-11-24T16:40:33.316Z'
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


INSERT INTO MenuItem (id, name, slug, description, price, imageUrl, isAvailable, isFeatured, categoryId, createdAt, updatedAt)
VALUES (
  'item_vermicelli_rice_fried_fish',
  'Vermicelli rice and Fried fish',
  'vermicelli-rice-and-fried-fish',
  'Fragrant vermicelli rice paired with crispy fried fish.',
  55,
  'https://i.pinimg.com/736x/a1/20/c7/a120c716081efb32e3a185ba7e5ff2b9.jpg',
  1,
  0,
  (SELECT id FROM Category WHERE slug = 'rice-dishes'),
  '2026-11-24T16:40:33.316Z',
  '2026-11-24T16:40:33.316Z'
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


INSERT INTO MenuItem (id, name, slug, description, price, imageUrl, isAvailable, isFeatured, categoryId, createdAt, updatedAt)
VALUES (
  'item_jollof_grilled_chicken',
  'Jollof rice and Grilled Chicked',
  'jollof-rice-and-grilled-chicked',
  'Signature smoky Ghanaian party jollof rice with grilled chicken.',
  75,
  'https://i.pinimg.com/736x/ba/a8/30/baa830bbfe09807d2966f080ba6117a0.jpg',
  1,
  1,
  (SELECT id FROM Category WHERE slug = 'rice-dishes'),
  '2026-11-24T16:40:33.316Z',
  '2026-11-24T16:40:33.316Z'
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


INSERT INTO MenuItem (id, name, slug, description, price, imageUrl, isAvailable, isFeatured, categoryId, createdAt, updatedAt)
VALUES (
  'item_fried_rice_grilled_chicken',
  'Fried rice and Grilled chicken',
  'fried-rice-and-grilled-chicken',
  'Savory vegetable fried rice served with tender grilled chicken.',
  75,
  'https://i.pinimg.com/736x/3f/0c/3f/3f0c3f59228e46e7f75d581d63b76e75.jpg',
  1,
  1,
  (SELECT id FROM Category WHERE slug = 'rice-dishes'),
  '2026-11-24T16:40:33.316Z',
  '2026-11-24T16:40:33.316Z'
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


INSERT INTO Category (id, name, slug, description, imageUrl, sortOrder, isActive, createdAt, updatedAt)
VALUES ('cat_salads_addons', 'salads/Add ons', 'salads-add-ons', 'Salads and sides', 'https://i.pinimg.com/736x/13/5b/23/135b233a1a7cbdab186d71a6ad4a0a00.jpg', 3, 1, '2026-11-24T16:40:33.316Z', '2026-11-24T16:40:33.316Z')
ON CONFLICT(slug) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  imageUrl = excluded.imageUrl,
  sortOrder = excluded.sortOrder,
  isActive = 1,
  updatedAt = excluded.updatedAt;


INSERT INTO MenuItem (id, name, slug, description, price, imageUrl, isAvailable, isFeatured, categoryId, createdAt, updatedAt)
VALUES (
  'item_ghanaian_salad',
  'Ghanaian salad',
  'ghanaian-salad',
  'Classic Ghanaian salad with cabbage, eggs, baked beans, and creamy dressing.',
  25,
  'https://i.pinimg.com/736x/13/5b/23/135b233a1a7cbdab186d71a6ad4a0a00.jpg',
  1,
  0,
  (SELECT id FROM Category WHERE slug = 'salads-add-ons'),
  '2026-11-24T16:40:33.316Z',
  '2026-11-24T16:40:33.316Z'
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


INSERT INTO MenuItem (id, name, slug, description, price, imageUrl, isAvailable, isFeatured, categoryId, createdAt, updatedAt)
VALUES (
  'item_kosua_ne_mako',
  'Kosua ne Mako',
  'kosua-ne-mako',
  'Fresh boiled eggs served with freshly ground Ghanaian pepper salsa (mako).',
  25,
  'https://i.pinimg.com/736x/f5/74/54/f5745471033bf8cf6f6f9e5b35fe1b25.jpg',
  1,
  0,
  (SELECT id FROM Category WHERE slug = 'salads-add-ons'),
  '2026-11-24T16:40:33.316Z',
  '2026-11-24T16:40:33.316Z'
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


INSERT INTO Category (id, name, slug, description, imageUrl, sortOrder, isActive, createdAt, updatedAt)
VALUES ('cat_combo_package', 'Combo Package', 'combo-package', 'Generous combo packages and sharing platters', 'https://i.pinimg.com/736x/35/b9/18/35b9185c7613b4a0b4972349dba2e6bf.jpg', 4, 1, '2026-11-24T16:40:33.316Z', '2026-11-24T16:40:33.316Z')
ON CONFLICT(slug) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  imageUrl = excluded.imageUrl,
  sortOrder = excluded.sortOrder,
  isActive = 1,
  updatedAt = excluded.updatedAt;


INSERT INTO MenuItem (id, name, slug, description, price, imageUrl, isAvailable, isFeatured, categoryId, createdAt, updatedAt)
VALUES (
  'item_waakye_jollof_combo',
  'Waakye, Jollof, Fried fish, Kentucky, Ghanaian salad, Shito',
  'waakye-jollof-fried-fish-kentucky-ghanaian-salad-shito',
  'Platter featuring Waakye, Jollof, Fried fish, Kentucky, Ghanaian salad, and Shito.',
  220,
  'https://i.pinimg.com/736x/35/b9/18/35b9185c7613b4a0b4972349dba2e6bf.jpg',
  1,
  1,
  (SELECT id FROM Category WHERE slug = 'combo-package'),
  '2026-11-24T16:40:33.316Z',
  '2026-11-24T16:40:33.316Z'
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


INSERT INTO Combo (id, name, slug, description, price, imageUrl, isAvailable, createdAt, updatedAt)
VALUES (
  'combo_mega_feast',
  'Waakye, Jollof, Fried fish, Kentucky, Ghanaian salad, Shito',
  'waakye-jollof-fried-fish-kentucky-ghanaian-salad-shito',
  'Platter featuring Waakye, Jollof, Fried fish, Kentucky, Ghanaian salad, and Shito.',
  220.0,
  'https://i.pinimg.com/736x/35/b9/18/35b9185c7613b4a0b4972349dba2e6bf.jpg',
  1,
  '2026-11-24T16:40:33.316Z',
  '2026-11-24T16:40:33.316Z'
)
ON CONFLICT(slug) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  imageUrl = excluded.imageUrl,
  isAvailable = 1,
  updatedAt = excluded.updatedAt;
