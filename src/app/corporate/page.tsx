import { prisma } from "@/lib/prisma";
import { getWhatsAppOrderUrl } from "@/lib/whatsapp";
import type { Metadata } from "next";
import {
  CorporateDirectoryClient,
  type CorporateFaq,
  type PublicCompanyInfo,
} from "./CorporateDirectoryClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Office Catering in Accra",
  description:
    "Set up office lunch ordering in Accra with individual staff orders and synchronized batch delivery. Eligible company portals may receive discounts or free delivery.",
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: corporateFaqs.map(({ question, answer }) => ({
              "@type": "Question",
              name: question,
              acceptedAnswer: { "@type": "Answer", text: answer },
            })),
          }),
        }}
      />
      <CorporateDirectoryClient
        companies={companies}
        corporateSignupWhatsAppUrl={corporateSignupWhatsAppUrl}
        faqs={corporateFaqs}
      />
    </>
  );
}
