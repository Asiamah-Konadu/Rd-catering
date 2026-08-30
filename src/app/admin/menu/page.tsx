import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { requireAnyRole } from "@/lib/authz";
import { MenuAdminClient } from "./MenuAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MenuAdminPage() {
  const user = await requireAnyRole(["ADMIN", "MENU_MANAGER"]);
  if (!user) redirect("/admin/login");

  const [categories, items] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    prisma.menuItem.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const formattedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  const formattedItems = items.map((i) => ({
    id: i.id,
    categoryId: i.categoryId,
    name: i.name,
    slug: i.slug,
    description: i.description,
    imageUrl: i.imageUrl,
    price: Number(i.price),
    isAvailable: i.isAvailable,
    isFeatured: i.isFeatured,
    category: i.category
      ? {
          id: i.category.id,
          name: i.category.name,
          slug: i.category.slug,
        }
      : undefined,
  }));

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase">
            Menu Administration
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Dishes & Menu Items
          </h1>
        </div>
      </div>
      <MenuAdminClient
        initialCategories={formattedCategories}
        initialItems={formattedItems}
      />
    </main>
  );
}
