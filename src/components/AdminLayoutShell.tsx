"use client";

import { useState } from "react";
import { AdminSidebar, AdminTopBar, type AdminSidebarUser } from "@/components/AdminSidebar";

interface AdminLayoutShellProps {
  user: AdminSidebarUser;
  children: React.ReactNode;
}

export function AdminLayoutShell({ user, children }: AdminLayoutShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans">
      <AdminSidebar
        user={user}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar
          user={user}
          onMenuOpen={() => setMobileOpen(true)}
        />
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}

