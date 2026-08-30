"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { UserRole } from "@prisma/client";

interface AdminNavProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    role: UserRole;
  };
}

const ROLE_BADGES: Record<UserRole, { label: string; className: string }> = {
  ADMIN: { label: "Admin", className: "bg-purple-100 text-purple-800 border-purple-200" },
  MENU_MANAGER: { label: "Menu Manager", className: "bg-blue-100 text-blue-800 border-blue-200" },
  ORDER_HANDLER: { label: "Order Handler", className: "bg-amber-100 text-amber-800 border-amber-200" },
  DELIVERY_AGENT: { label: "Delivery Agent", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  CUSTOMER: { label: "Customer", className: "bg-slate-100 text-slate-800 border-slate-200" },
};

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();
  const role = user.role;

  // Define route permissions
  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      roles: ["ADMIN", "MENU_MANAGER", "ORDER_HANDLER", "DELIVERY_AGENT"],
    },
    {
      label: "Menu Catalog",
      href: "/admin/menu",
      roles: ["ADMIN", "MENU_MANAGER"],
    },
    {
      label: "Categories",
      href: "/admin/categories",
      roles: ["ADMIN", "MENU_MANAGER"],
    },
    {
      label: "Order Queue",
      href: "/admin/orders",
      roles: ["ADMIN", "ORDER_HANDLER"],
    },
    {
      label: "Deliveries",
      href: "/admin/deliveries",
      roles: ["ADMIN", "ORDER_HANDLER", "DELIVERY_AGENT"],
    },
    {
      label: "Staff Accounts",
      href: "/admin/staff",
      roles: ["ADMIN"],
    },
  ];

  const allowedNavItems = navItems.filter((item) => item.roles.includes(role));
  const badgeInfo = ROLE_BADGES[role] || ROLE_BADGES.ADMIN;

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2 font-black text-xl tracking-tight text-amber-400">
              <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-lg text-sm font-black">
                RD
              </span>
              <span>Ops Portal</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {allowedNavItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition ${
                      isActive
                        ? "bg-amber-500 text-slate-950 shadow-xs"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile Pill & Sign Out */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full text-xs">
              <span className="font-semibold text-slate-200">
                {user.name || user.email?.split("@")[0]}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${badgeInfo.className}`}
              >
                {badgeInfo.label}
              </span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="bg-rose-900/40 hover:bg-rose-800/60 border border-rose-700/50 text-rose-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Mobile Navigation Links */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-3 pt-1 border-t border-slate-800">
          {allowedNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-300 bg-slate-800 hover:bg-slate-700"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
