import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/authz";
import { STAFF_ROLES } from "@/auth";
import { StaffAdminClient } from "./StaffAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StaffAdminPage() {
  const user = await requireRole("ADMIN");
  if (!user) redirect("/admin");

  const staff = await prisma.user.findMany({
    where: { role: { in: STAFF_ROLES } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  const formattedStaff = staff.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-purple-600 uppercase">
            Admin System Control
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Staff Account Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Provision, manage roles, and control active status for all operational staff users.
          </p>
        </div>
      </div>

      <StaffAdminClient initialStaff={formattedStaff} currentUserId={user.id} />
    </main>
  );
}
