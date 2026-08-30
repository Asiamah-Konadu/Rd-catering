import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/authz";
import { CategoryAdminClient } from "./CategoryAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CategoriesAdminPage() {
  const user = await requireAnyRole(["ADMIN", "MENU_MANAGER"]);
  if (!user) redirect("/admin/login");

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { menuItems: true } },
    },
  });

  const formattedCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
    isActive: category.isActive,
    sortOrder: category.sortOrder,
    menuItemsCount: category._count.menuItems,
  }));

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase">
            Menu Administration
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Dish Categories
          </h1>
        </div>
      </div>
      <CategoryAdminClient initialCategories={formattedCategories} />
    </main>
  );
}
