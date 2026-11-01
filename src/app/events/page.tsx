import type { Metadata } from "next";
import BusinessContactLinks from "@/components/BusinessContactLinks";
import { BUSINESS_CONTACT } from "@/lib/business";
import { getWhatsAppOrderUrl } from "@/lib/whatsapp";
import { EventInquiryClient } from "./EventInquiryClient";

const eventFaqs = [
  {
    question: "What events does Rich-Dons Catering cater?",
    answer:
      "Rich-Dons discusses catering for weddings and ceremonies, corporate functions, birthdays and reunions, and private dining.",
  },
  {
    question: "How do I request event catering?",
    answer:
      "Send an inquiry on WhatsApp with your event type, preferred date, guest count, and venue. The team will confirm availability and discuss menu options.",
  },
  {
    question: "How much does event catering cost?",
    answer:
      "Event menus and pricing are discussed for each booking. Share your guest count, venue, and budget to request a tailored quote.",
  },
  {
    question: "How far in advance should I book?",
    answer:
      "Availability depends on the event date. Share your preferred date with the inquiry so the team can check availability; no fixed minimum booking period is published.",
  },
  {
    question: "Where does Rich-Dons provide event catering?",
    answer:
      "Rich-Dons provides event catering in Accra and across Greater Accra. Include your venue or area when requesting availability.",
  },
];

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://rd-catering.vercel.app");

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
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
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
        serviceType: "Ghanaian event catering",
        provider: {
          "@type": "CateringService",
          name: "Rich-Dons Catering",
          url: siteUrl,
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
      <EventInquiryClient whatsappUrl={whatsappUrl} />
      <section
        aria-labelledby="event-faq-heading"
        className="mx-auto max-w-3xl px-4 py-12"
      >
        <h2
          id="event-faq-heading"
          className="mb-6 text-center text-2xl font-extrabold"
        >
          Event Catering FAQs
        </h2>
        <div className="space-y-5">
          {eventFaqs.map((faq) => (
            <article
              key={faq.question}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <h3 className="font-bold">{faq.question}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
      <BusinessContactLinks className="mx-auto mt-10 max-w-3xl gap-2 text-center text-sm not-italic text-slate-600" />
    </>
  );
}
