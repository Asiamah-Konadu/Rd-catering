import type { Metadata } from "next";
import { EventInquiryClient } from "./EventInquiryClient";
import { getWhatsAppOrderUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Event Catering & Appointments",
  description:
    "Plan weddings, birthdays, corporate events and private celebrations with Rich-Dons Catering in Accra.",
};

export default function EventCateringPage() {
  const whatsappUrl = getWhatsAppOrderUrl(
    "Hello Rich-Dons Catering! I'd like to make an appointment to discuss event catering."
  );

  return <EventInquiryClient whatsappUrl={whatsappUrl} />;
}
