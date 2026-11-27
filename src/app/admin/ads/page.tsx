import { redirect } from "next/navigation";
import { requireAnyRole } from "@/lib/authz";
import { getAdSenseConfig } from "@/lib/ads";
import { AdsAdminClient } from "./AdsAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminAdsPage() {
  const user = await requireAnyRole(["ADMIN", "MENU_MANAGER"]);
  if (!user) redirect("/admin/login");

  const config = await getAdSenseConfig();

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <AdsAdminClient initialConfig={config} />
    </div>
  );
}
