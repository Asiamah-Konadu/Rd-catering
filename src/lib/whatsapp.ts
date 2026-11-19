import { BUSINESS_CONTACT } from "@/lib/business";

export const DEFAULT_WHATSAPP_NUMBER = BUSINESS_CONTACT.whatsappInternational;
export const WHATSAPP_USERNAME = BUSINESS_CONTACT.whatsappUsername;
export const CUSTOMER_SERVICE_PHONE = BUSINESS_CONTACT.whatsappInternational;
export const CUSTOMER_SERVICE_PHONE_DISPLAY = "059 175 4764";
export const CUSTOMER_SERVICE_PHONE_INTL = "+233 (0) 59 175 4764";

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

type WhatsAppSendResult = { messageId: string };

export async function sendWhatsAppText(to: string, body: string): Promise<WhatsAppSendResult> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) throw new Error("WhatsApp Cloud API is not configured.");

  const version = process.env.WHATSAPP_GRAPH_API_VERSION || "v27.0";
  const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { preview_url: false, body },
    }),
  });
  const result = await response.json().catch(() => null) as { messages?: Array<{ id?: string }>; error?: { message?: string } } | null;
  if (!response.ok || !result?.messages?.[0]?.id) {
    throw new Error(result?.error?.message || `WhatsApp send failed (${response.status}).`);
  }
  return { messageId: result.messages[0].id };
}

export async function sendWhatsAppTemplate(to: string, name: string, parameters: string[]) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) throw new Error("WhatsApp Cloud API is not configured.");
  const version = process.env.WHATSAPP_GRAPH_API_VERSION || "v27.0";
  const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "template",
      template: {
        name,
        language: { code: process.env.WHATSAPP_PAYMENT_TEMPLATE_LANGUAGE || "en" },
        components: parameters.length ? [{ type: "body", parameters: parameters.map(text => ({ type: "text", text })) }] : [],
      },
    }),
  });
  const result = await response.json().catch(() => null) as { messages?: Array<{ id?: string }>; error?: { message?: string } } | null;
  if (!response.ok || !result?.messages?.[0]?.id) throw new Error(result?.error?.message || `WhatsApp template send failed (${response.status}).`);
  return { messageId: result.messages[0].id };
}
