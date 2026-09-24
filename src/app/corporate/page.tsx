import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { CorporateDirectoryClient, type PublicCompanyInfo } from "./CorporateDirectoryClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Corporate & Office Lunch Portals | Rich-Dons Catering",
  description:
    "Individual employee ordering with synchronized office batch delivery. Free delivery, corporate group discounts, and labeled packaging for offices across Accra.",
};

export default async function CorporateDirectoryPage() {
  const rawCompanies = await prisma.company.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const companies: PublicCompanyInfo[] = rawCompanies.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    address: c.address,
    city: c.city,
    region: c.region,
    dropoffLocation: c.dropoffLocation,
    cutoffTime: c.cutoffTime,
    batchDeliveryTime: c.batchDeliveryTime,
    discountPercent: Number(c.discountPercent),
    freeDelivery: c.freeDelivery,
    customPackaging: c.customPackaging,
  }));

  return <CorporateDirectoryClient companies={companies} />;
}
