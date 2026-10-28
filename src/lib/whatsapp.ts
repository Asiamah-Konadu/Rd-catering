export const DEFAULT_WHATSAPP_NUMBER = "233248179348";
export const CUSTOMER_SERVICE_PHONE = "+233248179348";
export const CUSTOMER_SERVICE_PHONE_DISPLAY = "024 817 9348";
export const CUSTOMER_SERVICE_PHONE_INTL = "+233 (0) 24 817 9348";

export function getWhatsAppNumber() {
  const rawNumber =
    process.env.WHATSAPP_ORDER_NUMBER ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    DEFAULT_WHATSAPP_NUMBER;
  return rawNumber.replace(/\D/g, "");
}

export function getWhatsAppOrderUrl(message: string) {
  const number = getWhatsAppNumber();
  if (!number || number.length < 10 || number.length > 15) return null;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
