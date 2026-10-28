import { prisma } from "@/lib/prisma";
import { getWhatsAppOrderUrl } from "@/lib/whatsapp";
import type { Metadata } from "next";
import { CorporateDirectoryClient, type PublicCompanyInfo } from "./CorporateDirectoryClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Corporate Lunch Portals & Office Catering Accra | Rich-Dons",
  description:
    "Streamline daily office lunches in Accra with Rich-Dons Catering. Individual employee ordering with synchronized office batch delivery, group discounts, and individually labeled packaging.",
  alternates: { canonical: "/corporate" },
  keywords: [
    "office lunch catering Accra",
    "corporate catering Ghana",
    "office food delivery Accra",
    "staff lunch service Accra",
    "company catering portal",
    "batch office lunch delivery",
    "Rich-Dons corporate",
  ],
  openGraph: {
    title: "Corporate Lunch Portals & Office Catering Accra | Rich-Dons",
    description:
      "Individual staff meal ordering with synchronized batch delivery. Free delivery, corporate discounts, and labeled packaging for offices across Accra.",
    url: "/corporate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Corporate Lunch Portals & Office Catering Accra | Rich-Dons",
    description:
      "Individual staff meal ordering with synchronized batch delivery for offices across Accra.",
  },
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

  const corporateSignupWhatsAppUrl = getWhatsAppOrderUrl(
    "Hello Rich-Dons Catering! I'd like to register my company for the Corporate Lunch Portal."
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rd-catering.vercel.app";

  const corporateSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Corporate Lunch Portals",
            item: `${siteUrl}/corporate`,
          },
        ],
      },
      {
        "@type": "Service",
        name: "Corporate Lunch Catering & Office Batch Delivery",
        serviceType: "Corporate Catering",
        provider: {
          "@type": "CateringService",
          name: "Rich-Dons Catering",
          url: siteUrl,
          telephone: "+233248179348",
        },
        areaServed: {
          "@type": "City",
          name: "Accra",
          addressCountry: "GH",
        },
        description:
          "Synchronized daily office batch delivery with custom company portals, employee dish customization, and volume discounts across Accra.",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(corporateSchema) }}
      />
      <CorporateDirectoryClient
        companies={companies}
        corporateSignupWhatsAppUrl={corporateSignupWhatsAppUrl}
      />
    </>
  );
}
