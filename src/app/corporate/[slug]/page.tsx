import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPublicMenu } from "@/lib/menu";
import type { Metadata } from "next";
import { CorporatePortalClient } from "./CorporatePortalClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await prisma.company.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { name: true, city: true },
  });
  if (!company) return { title: "Corporate Ordering Portal" };
  return {
    title: `${company.name} · Corporate Lunch Portal | Rich-Dons Catering`,
    description: `Order your individual meal for today's office lunch delivery at ${company.name}. Staff pick their own meals — one synchronized batch delivery to the office.`,
    robots: { index: false, follow: false },
  };
}

export default async function CorporatePortalPage({ params }: Props) {
  const { slug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug: slug.toLowerCase() },
  });

  if (!company || !company.isActive) notFound();

  const categories = await getPublicMenu();

  const companyData = {
    id: company.id,
    name: company.name,
    slug: company.slug,
    address: company.address,
    city: company.city,
    region: company.region,
    dropoffLocation: company.dropoffLocation,
    contactPersonName: company.contactPersonName,
    cutoffTime: company.cutoffTime,
    batchDeliveryTime: company.batchDeliveryTime,
    discountPercent: Number(company.discountPercent),
    freeDelivery: company.freeDelivery,
    customPackaging: company.customPackaging,
  };

  return <CorporatePortalClient company={companyData} categories={categories} />;
}
