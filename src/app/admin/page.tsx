import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/authz";
import type { UserRole } from "@prisma/client";
import {
  getAdminAnalytics,
  getKitchenAnalytics,
  getMenuManagerAnalytics,
  getDeliveryAgentAnalytics,
} from "@/lib/analytics";
import { AnalyticsDashboard } from "@/components/admin/analytics/AnalyticsDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  const user = await requireAnyRole();
  if (!user) redirect("/admin/login");

  const [
    pendingOrders,
    menuItemsCount,
    staffCount,
    activeDeliveriesCount,
  ] = await Promise.all([
    prisma.order.count({ where: { status: { in: ["PENDING", "CONFIRMED", "PREPARING"] } } }),
    prisma.menuItem.count(),
    prisma.user.count({ where: { role: { in: ["ADMIN", "MENU_MANAGER", "ORDER_HANDLER", "DELIVERY_AGENT"] } } }),
    prisma.delivery.count({ where: { status: { in: ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"] } } }),
  ]);

  const role = user.role as UserRole;

  // Fetch initial role-scoped analytics data server-side
  let initialAnalyticsData: unknown = null;
  try {
    if (role === "ADMIN") {
      initialAnalyticsData = await getAdminAnalytics("7d");
    } else if (role === "ORDER_HANDLER") {
      initialAnalyticsData = await getKitchenAnalytics();
    } else if (role === "MENU_MANAGER") {
      initialAnalyticsData = await getMenuManagerAnalytics();
    } else if (role === "DELIVERY_AGENT") {
      initialAnalyticsData = await getDeliveryAgentAnalytics(user.id, "today");
    }
  } catch (err) {
    console.error("Error loading server analytics:", err);
  }

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-amber-400 font-bold uppercase tracking-wider text-xs">
              Rich-Dons Catering Staff Hub
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold mt-1">
              Welcome back, {user.name || "Staff User"}!
            </h1>
            <p className="text-slate-300 text-sm mt-2 max-w-xl">
              You are signed in with <strong className="text-amber-300">{role.replaceAll("_", " ")}</strong> permissions. Real-time operations and role-tailored analytics are rendered below.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 text-right">
            <span className="block text-xs font-semibold text-slate-300">Live Active Queue</span>
            <strong className="text-2xl font-black text-amber-400">{pendingOrders} Orders</strong>
          </div>
        </div>
      </div>

      {/* Role-Based Analytics & Intelligence Dashboard */}
      {initialAnalyticsData && (
        <AnalyticsDashboard role={role} initialData={initialAnalyticsData} />
      )}

      {/* Role Action Modules */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your Action Modules</h2>
            <p className="text-xs text-slate-500">Quick shortcuts to manage day-to-day operations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ORDER_HANDLER & ADMIN module */}
          {(role === "ADMIN" || role === "ORDER_HANDLER") && (
            <Link
              href="/admin/orders"
              className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
                  📋
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  Kitchen & Order Queue
                </h3>
                <p className="text-slate-600 text-sm mt-1">
                  Manage live incoming orders, update status from PENDING to READY, and dispatch deliveries.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-700 uppercase">
                <span>Open Queue ({pendingOrders} active)</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          )}

          {/* MENU_MANAGER & ADMIN module */}
          {(role === "ADMIN" || role === "MENU_MANAGER") && (
            <Link
              href="/admin/menu"
              className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
                  🍲
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Menu Catalog Manager
                </h3>
                <p className="text-slate-600 text-sm mt-1">
                  Add/edit dishes, update pricing, toggle dish availability, and manage food categories.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-blue-700 uppercase">
                <span>Manage Menu ({menuItemsCount} items)</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          )}

          {/* DELIVERY_AGENT, ORDER_HANDLER & ADMIN module */}
          {(role === "ADMIN" || role === "ORDER_HANDLER" || role === "DELIVERY_AGENT") && (
            <Link
              href="/admin/deliveries"
              className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
                  🛵
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Delivery Agent Portal
                </h3>
                <p className="text-slate-600 text-sm mt-1">
                  Track assigned deliveries, view customer contact & location details, and update dispatch status.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase">
                <span>View Deliveries ({activeDeliveriesCount} in transit)</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          )}

          {/* ADMIN ONLY: Staff Management module */}
          {role === "ADMIN" && (
            <Link
              href="/admin/staff"
              className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-purple-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
                  👥
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                  Staff Account Management
                </h3>
                <p className="text-slate-600 text-sm mt-1">
                  Provision new staff accounts, assign roles (Admin, Menu Manager, Order Handler, Delivery Agent), and manage access.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-purple-700 uppercase">
                <span>Manage Staff ({staffCount} accounts)</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
