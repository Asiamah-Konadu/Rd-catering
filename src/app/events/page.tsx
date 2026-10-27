import type { Metadata } from "next";
import { EventInquiryClient } from "./EventInquiryClient";
import { getWhatsAppOrderUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Event Catering Accra | Weddings, Parties & Corporate Celebrations",
  description:
    "Bespoke Ghanaian event catering in Accra. Tailored menus for weddings, private banquets, birthdays, and corporate celebrations. Schedule a consultation on WhatsApp.",
  alternates: { canonical: "/events" },
  keywords: [
    "event catering Accra",
    "wedding catering Ghana",
    "party catering Accra",
    "corporate event food Accra",
    "buffet catering Ghana",
    "Ghanaian wedding food",
    "Rich-Dons event catering",
  ],
  openGraph: {
    title: "Event Catering Accra | Rich-Dons Catering",
    description:
      "Tailored Ghanaian menus for weddings, corporate celebrations, and private gatherings in Accra.",
    url: "/events",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Event Catering Accra | Rich-Dons Catering",
    description:
      "Tailored Ghanaian menus for weddings, corporate celebrations, and private gatherings in Accra.",
  },
};

export default function EventCateringPage() {
  const whatsappUrl = getWhatsAppOrderUrl(
    "Hello Rich-Dons Catering! I'd like to make an appointment to discuss event catering."
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rd-catering.vercel.app";

  const eventSchema = {
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
            name: "Event Catering",
            item: `${siteUrl}/events`,
          },
        ],
      },
      {
        "@type": "Service",
        name: "Event & Wedding Catering Services",
        serviceType: "Catering",
        provider: {
          "@type": "CateringService",
          name: "Rich-Dons Catering",
          url: siteUrl,
          telephone: "+233540000000",
        },
        areaServed: {
          "@type": "City",
          name: "Accra",
          addressCountry: "GH",
        },
        description:
          "Full-service event catering for weddings, corporate parties, birthdays, and intimate private banquets across Greater Accra.",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <EventInquiryClient whatsappUrl={whatsappUrl} />
    </>
  );
}
