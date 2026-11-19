import { createHmac, timingSafeEqual } from "node:crypto";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppTemplate, sendWhatsAppText } from "@/lib/whatsapp";

const PAYSTACK_API = "https://api.paystack.co";
const PAYSTACK_REFERENCE_PREFIX = "PS-";

export function normalizeGhanaPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (/^0\d{9}$/.test(digits)) return `233${digits.slice(1)}`;
  if (/^233\d{9}$/.test(digits)) return digits;
  return null;
}

type PaystackCharge = {
  status?: boolean;
  message?: string;
  data?: {
    reference?: string;
    status?: string;
    display_text?: string;
  };
};

type PaystackTransaction = {
  status?: boolean;
  message?: string;
  data?: {
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
    metadata?: { orderNumber?: string } | string | null;
    gateway_response?: string;
  };
};

function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("Paystack is not configured.");
  return key;
}

function paystackPhone(phone: string) {
  const normalized = normalizeGhanaPhone(phone);
  if (!normalized) throw new Error("The order does not have a valid Ghana mobile number.");
  return `0${normalized.slice(3)}`;
}

function expectedProvider() {
  const provider = (process.env.PAYSTACK_MOBILE_MONEY_PROVIDER || "mtn").toLowerCase();
  if (!["mtn", "atl", "vod"].includes(provider)) {
    throw new Error("PAYSTACK_MOBILE_MONEY_PROVIDER must be mtn, atl, or vod.");
  }
  return provider;
}

export async function requestPaystackMobileMoneyPayment(input: {
  reference: string;
  orderNumber: string;
  amount: number;
  phone: string;
  email: string;
}) {
  const amountPesewas = Math.round(input.amount * 100);
  if (!Number.isSafeInteger(amountPesewas) || amountPesewas < 1) {
    throw new Error("Order amount is invalid for a Paystack charge.");
  }

  const response = await fetch(`${PAYSTACK_API}/charge`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: String(amountPesewas),
      currency: "GHS",
      reference: input.reference,
      mobile_money: {
        phone: paystackPhone(input.phone),
        provider: expectedProvider(),
      },
      metadata: { orderNumber: input.orderNumber },
    }),
  });
  const result = await response.json().catch(() => null) as PaystackCharge | null;
  if (!response.ok || !result?.status || result.data?.reference !== input.reference) {
    throw new Error(result?.message || `Paystack charge request failed (${response.status}).`);
  }
  return {
    status: result.data.status || "pending",
    displayText: result.data.display_text || "Approve the mobile money request on your phone to complete payment.",
  };
}

async function verifyPaystackTransaction(reference: string) {
  const response = await fetch(`${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
    cache: "no-store",
  });
  const result = await response.json().catch(() => null) as PaystackTransaction | null;
  if (!response.ok || !result?.status || !result.data?.reference) {
    throw new Error(result?.message || `Paystack verification failed (${response.status}).`);
  }
  return result.data;
}

export async function settlePaystackPayment(reference: string) {
  const transaction = await verifyPaystackTransaction(reference);
  const payment = await prisma.payment.findFirst({
    where: {
      transactionId: reference,
      method: PaymentMethod.MOBILE_MONEY,
      status: PaymentStatus.PROCESSING,
    },
    include: { order: true },
  });
  if (!payment) return { found: false, completed: false };

  const expectedAmount = Math.round(Number(payment.amount) * 100);
  const metadataOrder = typeof transaction.metadata === "object" && transaction.metadata
    ? transaction.metadata.orderNumber
    : undefined;
  if (
    transaction.reference !== reference ||
    transaction.currency !== "GHS" ||
    transaction.amount !== expectedAmount ||
    metadataOrder !== payment.order.orderNumber
  ) {
    console.error("Paystack transaction details did not match the order", { orderNumber: payment.order.orderNumber });
    return { found: true, completed: false };
  }

  let nextStatus: PaymentStatus | null = null;
  if (transaction.status === "success") nextStatus = PaymentStatus.PAID;
  if (["failed", "abandoned"].includes(transaction.status || "")) nextStatus = PaymentStatus.FAILED;
  if (!nextStatus) {
    await prisma.payment.updateMany({
      where: { id: payment.id, status: PaymentStatus.PROCESSING, transactionId: reference },
      data: { updatedAt: new Date() },
    });
    return { found: true, completed: false };
  }

  const updated = await prisma.payment.updateMany({
    where: { id: payment.id, status: PaymentStatus.PROCESSING, transactionId: reference },
    data: { status: nextStatus },
  });
  if (updated.count !== 1) return { found: true, completed: false };

  const customer = normalizeGhanaPhone(payment.order.customerPhone);
  if (customer) {
    const text = nextStatus === PaymentStatus.PAID
      ? `Payment confirmed for order ${payment.order.orderNumber}. We received GHS ${payment.amount.toFixed(2)}. Thank you for ordering with Rich-Dons Catering.`
      : `The mobile money payment for order ${payment.order.orderNumber} was not completed. Please contact Rich-Dons Catering if you would like another payment request.`;
    try {
      await sendWhatsAppText(customer, text);
    } catch (error) {
      const templateName = nextStatus === PaymentStatus.PAID
        ? process.env.WHATSAPP_PAYMENT_CONFIRMED_TEMPLATE
        : process.env.WHATSAPP_PAYMENT_FAILED_TEMPLATE;
      if (templateName) {
        try {
          await sendWhatsAppTemplate(customer, templateName, [payment.order.orderNumber, payment.amount.toFixed(2)]);
        } catch (templateError) {
          console.error("Payment status saved but WhatsApp confirmation failed", { orderNumber: payment.order.orderNumber, error, templateError });
        }
      } else {
        console.error("Payment status saved but WhatsApp confirmation failed", { orderNumber: payment.order.orderNumber, error });
      }
    }
  }
  return { found: true, completed: nextStatus === PaymentStatus.PAID };
}

export function isValidPaystackSignature(rawBody: string, signature: string | null) {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key || !signature || !/^[a-f0-9]{128}$/i.test(signature)) return false;
  const actual = Buffer.from(signature, "hex");
  const expected = createHmac("sha512", key).update(rawBody).digest();
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export { PAYSTACK_REFERENCE_PREFIX };
