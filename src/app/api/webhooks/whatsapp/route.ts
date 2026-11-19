import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeGhanaPhone, requestMtnMomoPayment } from "@/lib/mtn-momo";
import { sendWhatsAppText } from "@/lib/whatsapp";

export const runtime = "nodejs";

type IncomingMessage = { from?: string; type?: string; text?: { body?: string } };
type WebhookBody = {
  entry?: Array<{ changes?: Array<{ value?: { messages?: IncomingMessage[] } }> }>;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  if (mode === "subscribe" && expected && token === expected && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Webhook verification failed" }, { status: 403 });
}

function signatureIsValid(rawBody: string, signature: string | null) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret || !signature?.startsWith("sha256=")) return false;
  const actual = Buffer.from(signature.slice(7), "hex");
  const expected = createHmac("sha256", appSecret).update(rawBody).digest();
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function beginPayment(message: IncomingMessage) {
  if (message.type !== "text" || !message.text?.body || !message.from) return;
  const orderMatch = message.text.body.match(/\b(RD-\d{8}-[A-F0-9]{8})\b/i);
  if (!orderMatch) return;

  const sender = normalizeGhanaPhone(message.from);
  if (!sender) return;
  const order = await prisma.order.findUnique({
    where: { orderNumber: orderMatch[1].toUpperCase() },
    include: { payment: true },
  });
  if (!order || normalizeGhanaPhone(order.customerPhone) !== sender || !order.payment) return;
  if (order.status === "CANCELLED") return;
  if (order.payment.status !== PaymentStatus.PENDING) return;

  const referenceId = randomUUID();
  const claim = await prisma.payment.updateMany({
    where: { id: order.payment.id, status: PaymentStatus.PENDING },
    data: { status: PaymentStatus.PROCESSING, method: PaymentMethod.MOBILE_MONEY, transactionId: referenceId },
  });
  if (claim.count !== 1) return;

  try {
    await requestMtnMomoPayment({
      referenceId,
      amount: order.payment.amount.toFixed(2),
      phone: sender,
      orderNumber: order.orderNumber,
    });
    await sendWhatsAppText(sender, `Payment request sent for order ${order.orderNumber} (GH₵ ${order.payment.amount.toFixed(2)}). Approve it on your MTN MoMo phone to complete payment.`);
  } catch (error) {
    console.error("Could not start MTN MoMo payment", { orderNumber: order.orderNumber, error });
    // Keep PROCESSING when the network outcome is uncertain to prevent duplicate collection.
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!signatureIsValid(rawBody, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let payload: WebhookBody;
  try {
    payload = JSON.parse(rawBody) as WebhookBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = payload.entry?.flatMap(entry =>
    entry.changes?.flatMap(change => change.value?.messages ?? []) ?? []
  ) ?? [];
  for (const message of messages) {
    try {
      await beginPayment(message);
    } catch (error) {
      console.error("WhatsApp order webhook processing failed", error);
    }
  }
  return NextResponse.json({ received: true });
}
