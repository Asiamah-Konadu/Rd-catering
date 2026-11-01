import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/authz";
import { getShowcaseConfig } from "@/lib/showcase";
import { ShowcaseAdminClient } from "./ShowcaseAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ShowcaseAdminPage() {
  const user = await requireAnyRole(["ADMIN", "MENU_MANAGER"]);
  if (!user) redirect("/admin/login");

  const [config, menuItems] = await Promise.all([
    getShowcaseConfig(),
    prisma.menuItem.findMany({
      where: { isAvailable: true },
      include: { category: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const formattedMenuItems = menuItems.map((m) => ({
    id: m.id,
    name: m.name,
    slug: m.slug,
    description: m.description || "",
    category: m.category?.name || "Kitchen Special",
    imageUrl: m.imageUrl || "/coming-soon/jolof.avif",
    price: Number(m.price),
  }));

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase">
            Storefront Curation
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Home Food Showcase (&quot;What Sounds Good?&quot;)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Curate the signature dishes, titles, and storytelling presented in the 3D WebGL food showcase on the home page.
          </p>
        </div>
      </div>

      <ShowcaseAdminClient initialConfig={config} menuItems={formattedMenuItems} />
    </main>
  );
}
