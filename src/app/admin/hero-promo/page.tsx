import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/authz";
import { HeroPromoAdminClient } from "./HeroPromoAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HeroPromoAdminPage() {
  const user = await requireAnyRole(["ADMIN", "MENU_MANAGER"]);
  if (!user) redirect("/admin/login");

  const promo = await prisma.heroPromo.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  const menuItems = await prisma.menuItem.findMany({
    where: { isAvailable: true, imageUrl: { not: null } },
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      price: true,
    },
    orderBy: { name: "asc" },
  });

  const formattedPromo = promo
    ? {
        id: promo.id,
        title: promo.title,
        subtitle: promo.subtitle || "Holiday Special",
        badgeText: promo.badgeText || "SPECIAL / GH",
        imageUrl: promo.imageUrl,
        description: promo.description,
        price: promo.price ? Number(promo.price) : null,
        linkUrl: promo.linkUrl || "/menu",
        isActive: promo.isActive,
      }
    : null;

  const formattedMenuItems = menuItems.map((m) => ({
    id: m.id,
    name: m.name,
    slug: m.slug,
    imageUrl: m.imageUrl || "",
    price: Number(m.price),
  }));

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-rose-600 uppercase">
            Marketing & Campaigns
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Hero Combo Special & Holiday Advertising
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Feature combo specials on the homepage hero during holidays (Valentine’s, Christmas, Easter, etc.). When turned off, the homepage returns to the default kitchen photo.
          </p>
        </div>
      </div>

      <HeroPromoAdminClient
        initialPromo={formattedPromo}
        menuItems={formattedMenuItems}
      />
    </main>
  );
}
