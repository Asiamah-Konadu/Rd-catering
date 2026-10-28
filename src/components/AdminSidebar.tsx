"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import type { UserRole } from "@prisma/client";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tags,
  PackagePlus,
  Star,
  CalendarDays,
  Sparkles,
  Settings2,
  ClipboardList,
  Truck,
  Users,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  X,
  Menu,
  ExternalLink,
} from "lucide-react";

export interface AdminSidebarUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  role: UserRole;
}

interface AdminSidebarProps {
  user: AdminSidebarUser;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

// ── Role badge config ──────────────────────────────────────────────────────
const ROLE_BADGES: Record<UserRole, { label: string; color: string }> = {
  ADMIN:          { label: "Admin",          color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  MENU_MANAGER:   { label: "Menu Manager",   color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  ORDER_HANDLER:  { label: "Order Handler",  color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  DELIVERY_AGENT: { label: "Delivery Agent", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  CUSTOMER:       { label: "Customer",       color: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
};

// ── Navigation groups & items ──────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Operations",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        roles: ["ADMIN", "MENU_MANAGER", "ORDER_HANDLER", "DELIVERY_AGENT"],
        exact: true,
      },
      {
        label: "Order Queue",
        href: "/admin/orders",
        icon: ClipboardList,
        roles: ["ADMIN", "ORDER_HANDLER"],
      },
      {
        label: "Deliveries",
        href: "/admin/deliveries",
        icon: Truck,
        roles: ["ADMIN", "ORDER_HANDLER", "DELIVERY_AGENT"],
      },
    ],
  },
  {
    label: "Menu & Content",
    items: [
      {
        label: "Menu Catalog",
        href: "/admin/menu",
        icon: UtensilsCrossed,
        roles: ["ADMIN", "MENU_MANAGER"],
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: Tags,
        roles: ["ADMIN", "MENU_MANAGER"],
      },
      {
        label: "Extras & Combos",
        href: "/admin/extras",
        icon: PackagePlus,
        roles: ["ADMIN", "MENU_MANAGER"],
      },
      {
        label: "Hero & Promos",
        href: "/admin/hero-promo",
        icon: Star,
        roles: ["ADMIN", "MENU_MANAGER"],
      },
      {
        label: "Weekly Dishes",
        href: "/admin/weekly-menu",
        icon: CalendarDays,
        roles: ["ADMIN", "MENU_MANAGER"],
      },
      {
        label: "Showcase",
        href: "/admin/showcase",
        icon: Sparkles,
        roles: ["ADMIN", "MENU_MANAGER"],
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        label: "Companies",
        href: "/admin/companies",
        icon: Building2,
        roles: ["ADMIN", "ORDER_HANDLER"],
      },
      {
        label: "Staff Accounts",
        href: "/admin/staff",
        icon: Users,
        roles: ["ADMIN"],
      },
      {
        label: "Site Settings",
        href: "/admin/settings",
        icon: Settings2,
        roles: ["ADMIN", "MENU_MANAGER"],
      },
    ],
  },
];

// ── Sidebar inner (shared between desktop + mobile) ────────────────────────
function SidebarContent({
  user,
  collapsed,
  onCollapse,
  onClose,
}: {
  user: AdminSidebarUser;
  collapsed: boolean;
  onCollapse?: () => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const role = user.role;
  const badge = ROLE_BADGES[role] || ROLE_BADGES.ADMIN;
  const displayName = user.name || user.email?.split("@")[0] || "Staff";

  // Collapsed groups state — persists while sidebar is collapsed
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Operations: true,
    "Menu & Content": true,
    Management: true,
  });

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="flex flex-col h-full">
      {/* ─── Brand Header ───────────────────────────────────────── */}
      <div
        className={`flex items-center h-16 px-4 border-b border-slate-700/60 shrink-0 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <Link
            href="/admin"
            className="flex items-center gap-2.5 min-w-0"
            onClick={onClose}
          >
            <span className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0">
              RD
            </span>
            <div className="min-w-0">
              <div className="font-black text-white text-sm leading-tight tracking-tight">
                Rich-Dons
              </div>
              <div className="text-[10px] text-amber-400 font-semibold leading-tight uppercase tracking-widest">
                Ops Portal
              </div>
            </div>
          </Link>
        )}

        {collapsed && (
          <Link href="/admin" className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm" onClick={onClose}>
            RD
          </Link>
        )}

        {/* Close button on mobile */}
        {onClose && !onCollapse && (
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Collapse toggle on desktop */}
        {onCollapse && (
          <button
            onClick={onCollapse}
            className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* ─── Navigation Groups ──────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 scrollbar-thin">
        {NAV_GROUPS.map((group) => {
          const groupItems = group.items.filter((item) =>
            item.roles.includes(role)
          );
          if (groupItems.length === 0) return null;

          const isGroupExpanded = expandedGroups[group.label] !== false;

          return (
            <div key={group.label} className="px-2">
              {/* Group label */}
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-2 py-1.5 mb-1 group"
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 group-hover:text-slate-400 transition">
                    {group.label}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 text-slate-500 transition-transform ${
                      isGroupExpanded ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </button>
              )}

              {/* Items */}
              {(isGroupExpanded || collapsed) &&
                groupItems.map((item) => {
                  const active = isActive(item.href, item.exact);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all group relative ${
                        active
                          ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-900/30"
                          : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                      } ${collapsed ? "justify-center px-2" : ""}`}
                    >
                      <Icon
                        className={`shrink-0 transition-transform group-hover:scale-105 ${
                          collapsed ? "w-5 h-5" : "w-4 h-4"
                        } ${active ? "text-slate-950" : ""}`}
                      />
                      {!collapsed && (
                        <span className="text-sm font-semibold leading-tight">
                          {item.label}
                        </span>
                      )}

                      {/* Tooltip on collapsed */}
                      {collapsed && (
                        <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50 bg-slate-800 border border-slate-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  );
                })}

              {/* Separator between groups */}
              <div className="border-t border-slate-700/40 my-2" />
            </div>
          );
        })}

        {/* Storefront link */}
        <div className="px-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title={collapsed ? "View Storefront" : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition text-slate-400 hover:bg-slate-700/50 hover:text-white group relative ${
              collapsed ? "justify-center px-2" : ""
            }`}
          >
            <ExternalLink className={`shrink-0 ${collapsed ? "w-5 h-5" : "w-4 h-4"}`} />
            {!collapsed && (
              <span className="text-sm font-semibold leading-tight">View Storefront</span>
            )}
            {collapsed && (
              <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50 bg-slate-800 border border-slate-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                View Storefront
              </div>
            )}
          </Link>
        </div>
      </nav>

      {/* ─── User Profile + Sign Out ────────────────────────────── */}
      <div className="shrink-0 border-t border-slate-700/60 p-3">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-8 h-8 rounded-full bg-slate-600 border border-slate-500 flex items-center justify-center text-xs font-black text-white shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white truncate leading-tight">
                  {displayName}
                </div>
                <div className="text-[10px] text-slate-400 truncate leading-tight">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 px-1">
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full border ${badge.color}`}
              >
                {badge.label}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-900/30 hover:bg-rose-800/50 border border-rose-700/40 text-rose-300 hover:text-rose-200 text-xs font-semibold transition"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-600 border border-slate-500 flex items-center justify-center text-xs font-black text-white" title={displayName}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              title="Sign out"
              className="p-1.5 rounded-lg bg-rose-900/30 hover:bg-rose-800/50 border border-rose-700/40 text-rose-300 hover:text-rose-200 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main exported AdminSidebar ─────────────────────────────────────────────
export function AdminSidebar({ user, mobileOpen, onMobileClose }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* ─── Desktop Sidebar ─────────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col bg-slate-900 border-r border-slate-700/60 h-screen sticky top-0 z-30 transition-all duration-200 ease-in-out shrink-0 ${
          collapsed ? "w-[68px]" : "w-[240px]"
        }`}
      >
        <SidebarContent
          user={user}
          collapsed={collapsed}
          onCollapse={() => setCollapsed((c) => !c)}
        />
      </aside>

      {/* ─── Mobile Overlay + Drawer ──────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />

          {/* Drawer */}
          <aside className="absolute left-0 top-0 h-full w-[260px] bg-slate-900 border-r border-slate-700/60 flex flex-col shadow-2xl">
            <SidebarContent
              user={user}
              collapsed={false}
              onClose={onMobileClose}
            />
          </aside>
        </div>
      )}
    </>
  );
}

// ── Top bar (mobile hamburger + page title placeholder) ────────────────────
export function AdminTopBar({
  user,
  onMenuOpen,
}: {
  user: AdminSidebarUser;
  onMenuOpen: () => void;
}) {
  const pathname = usePathname();
  const badge = ROLE_BADGES[user.role] || ROLE_BADGES.ADMIN;

  // Derive page title from pathname
  const pageTitle = (() => {
    if (pathname === "/admin") return "Dashboard";
    const segment = pathname.split("/").pop() ?? "";
    return segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  })();

  return (
    <header className="md:hidden sticky top-0 z-30 h-14 bg-slate-900 border-b border-slate-700/60 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuOpen}
          className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-700/60 hover:text-white transition"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-black text-[10px]">
            RD
          </span>
          <span className="text-white font-bold text-sm">{pageTitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full border ${badge.color}`}>
          {badge.label}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="p-1.5 rounded-lg bg-rose-900/30 hover:bg-rose-800/50 border border-rose-700/40 text-rose-300 transition"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

