export function getWhatsAppOrderUrl(message: string) {
  const number = process.env.WHATSAPP_ORDER_NUMBER?.replace(/\D/g, "");
  if (!number || number.length < 10 || number.length > 15) return null;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}