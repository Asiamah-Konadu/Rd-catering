import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/authz";
import { ExtrasAdminClient } from "./ExtrasAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ExtrasAdminPage() {
  const user = await requireAnyRole(["ADMIN", "MENU_MANAGER"]);
  if (!user) redirect("/admin/login");

  const extras = await prisma.extra.findMany({
    orderBy: [{ isActive: "desc" }, { price: "desc" }],
    include: {
      _count: { select: { orderExtras: true } },
    },
  });

  const formattedExtras = extras.map((e) => ({
    id: e.id,
    name: e.name,
    price: Number(e.price),
    isActive: e.isActive,
    ordersCount: e._count.orderExtras,
  }));

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase">
            Menu Administration
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Combo Extras & Add-ons
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage extra proteins, sides, and additions available for meal combos (e.g., Grilled Chicken, Fried Fish, Yam Balls, Salad).
          </p>
        </div>
      </div>

      <ExtrasAdminClient initialExtras={formattedExtras} />
    </main>
  );
}
