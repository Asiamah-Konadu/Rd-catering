import { prisma } from "@/lib/prisma";
import { getWhatsAppOrderUrl } from "@/lib/whatsapp";
import { SITE_URL } from "@/lib/site-url";
import type { Metadata } from "next";
import {
  CorporateDirectoryClient,
  type CorporateFaq,
  type PublicCompanyInfo,
} from "./CorporateDirectoryClient";

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

const corporateFaqs: CorporateFaq[] = [
  {
    question: "How can my company get an office lunch portal?",
    answer:
      "Register through the WhatsApp link on this page. Portal setup is free, has no minimum contract, and is completed within 24 hours.",
  },
  {
    question: "How do employees order and pay?",
    answer:
      "Employees choose meals through their company portal and submit orders individually. Rich-Dons sends the order details to WhatsApp and confirms availability and payment in chat.",
  },
  {
    question: "How are office lunches delivered?",
    answer:
      "Orders for a registered company are grouped into one labeled batch delivery. The company portal shows its order cutoff and delivery time.",
  },
  {
    question: "Where do you provide office catering?",
    answer:
      "Active company portals listed on this page show their delivery location and schedule. Contact Rich-Dons to check availability for another workplace in Accra.",
  },
];

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
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Corporate Lunch Portals",
            item: `${SITE_URL}/corporate`,
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
          url: SITE_URL,
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
      {
        "@type": "FAQPage",
        mainEntity: corporateFaqs.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
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
        faqs={corporateFaqs}
      />
    </>
  );
}
