import type { Metadata } from "next";
import { BUSINESS_CONTACT } from "@/lib/business";
import { getWhatsAppOrderUrl } from "@/lib/whatsapp";
import { SITE_URL } from "@/lib/site-url";
import { EventInquiryClient } from "./EventInquiryClient";

const eventFaqs = [
  {
    question: "What events does Rich-Dons Catering cater?",
    answer:
      "Rich-Dons provides full-service catering for weddings and traditional engagements, corporate banquets and galas, milestone birthdays, anniversaries, and bespoke private dining.",
  },
  {
    question: "How do I request event catering?",
    answer:
      "Send an inquiry on WhatsApp or submit the booking form with your event type, preferred date, guest count, and venue in Accra. Our team will verify date availability and curate a tailored menu proposal.",
  },
  {
    question: "How much does event catering cost?",
    answer:
      "Event menus and pricing are customized for each booking based on your guest count, chosen dishes, and serving format. Share your estimated budget to receive a personalized quote.",
  },
  {
    question: "How far in advance should I book?",
    answer:
      "We recommend booking at least 1 to 3 weeks in advance for large celebrations to secure your preferred date, though we also accommodate shorter-notice bookings depending on kitchen capacity.",
  },
  {
    question: "Where does Rich-Dons provide event catering?",
    answer:
      "We cater events across Accra and Greater Accra, including East Legon, Airport Residential, Cantonments, Dzorwulu, Ridge, Osu, Tema, and surrounding areas.",
  },
  {
    question: "Do you provide chafing dishes and banquet stewards?",
    answer:
      "Yes. We provide complete chafing dish setups with food warmers, serving utensils, and professional banquet attendants to ensure food stays fresh and hot throughout your event.",
  },
];

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
  const eventSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Event Catering",
            item: `${SITE_URL}/events`,
          },
        ],
      },
      {
        "@type": "Service",
        name: "Event & Wedding Catering Services",
        serviceType: "Ghanaian event catering",
        provider: {
          "@type": "CateringService",
          name: "Rich-Dons Catering",
          url: SITE_URL,
          telephone: BUSINESS_CONTACT.whatsappInternational,
        },
        areaServed: {
          "@type": "AdministrativeArea",
          name: "Greater Accra, Ghana",
        },
        description:
          "Full-service event catering for weddings, corporate parties, birthdays, and private banquets across Greater Accra.",
      },
      {
        "@type": "FAQPage",
        mainEntity: eventFaqs.map(({ question, answer }) => ({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <EventInquiryClient whatsappUrl={whatsappUrl} faqs={eventFaqs} />
    </>
  );
}
