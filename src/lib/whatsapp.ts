import { BUSINESS_CONTACT } from "@/lib/business";

export function getWhatsAppOrderUrl(message: string) {
  const number = BUSINESS_CONTACT.whatsappInternational.replace(/\D/g, "");

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}