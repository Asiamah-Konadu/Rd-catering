import { auth } from "@/auth";
import { AdminNav } from "@/components/AdminNav";
import type { UserRole } from "@prisma/client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {user && user.role && (
        <AdminNav
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as UserRole,
          }}
        />
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
}
