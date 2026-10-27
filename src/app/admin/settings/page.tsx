import { redirect } from "next/navigation";
import { requireAnyRole } from "@/lib/authz";
import { getSiteSettings } from "@/lib/settings";
import { SettingsAdminClient } from "./SettingsAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSettingsPage() {
  const user = await requireAnyRole(["ADMIN", "MENU_MANAGER"]);
  if (!user) redirect("/admin/login");

  const settings = await getSiteSettings();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <SettingsAdminClient initialSettings={settings} userRole={user.role} />
    </div>
  );
}
