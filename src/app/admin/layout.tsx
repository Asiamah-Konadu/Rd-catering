import { auth } from "@/auth";
import { AdminLayoutShell } from "@/components/AdminLayoutShell";
import type { UserRole } from "@prisma/client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  if (!user || !user.role) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        {children}
      </div>
    );
  }

  return (
    <AdminLayoutShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
      }}
    >
      {children}
    </AdminLayoutShell>
  );
}
