import { BUSINESS_CONTACT } from "@/lib/business";

export default function BusinessContactLinks({ className }: { className?: string }) {
  return (
    <address className={className} aria-label="Rich-Dons Catering contact details">
      <strong>Contact Rich-Dons Catering</strong>
      <a href={`https://wa.me/${BUSINESS_CONTACT.whatsappInternational.slice(1)}`}>
        WhatsApp {BUSINESS_CONTACT.whatsapp}
      </a>
      {BUSINESS_CONTACT.phones.map((phone) => (
        <a key={phone} href={`tel:+233${phone.slice(1)}`}>{phone}</a>
      ))}
    </address>
  );
}
