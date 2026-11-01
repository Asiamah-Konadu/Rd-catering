import type { Metadata } from "next";
import BusinessContactLinks from "@/components/BusinessContactLinks";
import { BUSINESS_CONTACT } from "@/lib/business";
import { getWhatsAppOrderUrl } from "@/lib/whatsapp";
import { EventInquiryClient } from "./EventInquiryClient";

export const metadata: Metadata = {
  title: "Event Catering in Accra",
  description:
    "Plan Ghanaian event catering in Accra for weddings, corporate functions, birthdays, and private dining. Send your date and guest count to request availability.",
  alternates: { canonical: "/events" },
  openGraph: {
    title: "Event Catering in Accra | Rich-Dons Catering",
    description:
      "Request availability and a tailored Ghanaian catering menu for your Accra event.",
    url: "/events",
    type: "website",
  },
};

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

export default function EventCateringPage() {
  const whatsappUrl = getWhatsAppOrderUrl(
    "Hello Rich-Dons Catering! I'd like to enquire about event catering."
  );
  const eventSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: "Event Catering",
        serviceType: "Ghanaian event catering",
        provider: {
          "@type": "CateringService",
          name: "Rich-Dons Catering",
          url: siteUrl,
          telephone: BUSINESS_CONTACT.whatsappInternational,
          areaServed: {
            "@type": "AdministrativeArea",
            name: "Greater Accra, Ghana",
          },
        },
        description:
          "Ghanaian catering for weddings, corporate functions, birthdays, and private dining in Accra.",
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
    <main className="min-h-screen bg-stone-50 px-4 py-12 text-slate-900 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <header className="mx-auto mb-12 max-w-3xl text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-widest text-amber-700">
          Rich-Dons Catering · Accra
        </p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          Event Catering in Accra
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
          Ghanaian catering for weddings, corporate functions, birthdays, reunions, and private dining.
          Tell us your date, guest count, and venue to check availability and plan a menu.
        </p>
      </header>

      <section aria-labelledby="event-inquiry-heading" className="mx-auto mb-16 max-w-4xl">
        <h2 id="event-inquiry-heading" className="mb-2 text-center text-2xl font-extrabold">
          Request event availability
        </h2>
        <p className="mb-6 text-center text-slate-600">
          Share the event details and continue in WhatsApp to discuss availability and menu options.
        </p>
        <EventInquiryClient whatsappUrl={whatsappUrl} />
      </section>

      <section aria-labelledby="event-faq-heading" className="mx-auto max-w-3xl">
        <h2 id="event-faq-heading" className="mb-6 text-center text-2xl font-extrabold">
          Event Catering FAQs
        </h2>
        <div className="space-y-5">
          {eventFaqs.map((faq) => (
            <article key={faq.question} className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-bold">{faq.question}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
      <BusinessContactLinks className="mx-auto mt-10 max-w-3xl gap-2 text-center text-sm not-italic text-slate-600" />
    </main>
  );
}
