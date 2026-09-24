import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { requireAnyRole } from "@/lib/authz";
import { CompaniesAdminClient } from "./CompaniesAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CompaniesAdminPage() {
  const user = await requireAnyRole(["ADMIN", "ORDER_HANDLER"]);
  if (!user) redirect("/admin");

  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        select: {
          id: true,
          total: true,
          createdAt: true,
          status: true,
        },
      },
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatted = companies.map((c) => {
    const todayOrders = c.orders.filter((o) => new Date(o.createdAt) >= today);
    const totalRevenue = c.orders.reduce((sum, o) => sum + Number(o.total), 0);
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      address: c.address,
      city: c.city,
      region: c.region,
      dropoffLocation: c.dropoffLocation,
      contactPersonName: c.contactPersonName,
      contactPhone: c.contactPhone,
      contactEmail: c.contactEmail,
      cutoffTime: c.cutoffTime,
      batchDeliveryTime: c.batchDeliveryTime,
      discountPercent: Number(c.discountPercent),
      freeDelivery: c.freeDelivery,
      customPackaging: c.customPackaging,
      isActive: c.isActive,
      notes: c.notes,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      totalOrdersCount: c.orders.length,
      todayOrdersCount: todayOrders.length,
      totalRevenue,
    };
  });

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase">
            Corporate Portal Management
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Registered Companies
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Register corporate clients for hybrid group ordering — staff order individually, food arrives in one synchronized batch delivery.
          </p>
        </div>
      </div>

      <CompaniesAdminClient initialCompanies={formatted} />
    </main>
  );
}
