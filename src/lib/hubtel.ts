import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const HUBTEL_CHECKOUT_API = "https://payproxyapi.hubtel.com/items/initiate";
const HUBTEL_STATUS_API = "https://api-txnstatus.hubtel.com/transactions";
const HUBTEL_REFERENCE_PREFIX = "HB-";

export function isHubtelConfigured(): boolean {
  const apiId = process.env.HUBTEL_API_ID || process.env.HUBTEL_CLIENT_ID;
  const apiKey = process.env.HUBTEL_API_KEY || process.env.HUBTEL_CLIENT_SECRET;
  const account = process.env.HUBTEL_COLLECTION_ACCOUNT || process.env.HUBTEL_MERCHANT_ACCOUNT_NUMBER || process.env.HUBTEL_ACCOUNT_NUMBER;
  return Boolean(apiId && apiKey && account);
}

function credentials() {
  const apiId = process.env.HUBTEL_API_ID || process.env.HUBTEL_CLIENT_ID;
  const apiKey = process.env.HUBTEL_API_KEY || process.env.HUBTEL_CLIENT_SECRET;
  const account = process.env.HUBTEL_COLLECTION_ACCOUNT || process.env.HUBTEL_MERCHANT_ACCOUNT_NUMBER || process.env.HUBTEL_ACCOUNT_NUMBER;
  if (!apiId || !apiKey || !account) throw new Error("Hubtel Online Checkout is not configured.");
  return { apiId, apiKey, account };
}

function basicAuth(apiId: string, apiKey: string) {
  return `Basic ${btoa(`${apiId}:${apiKey}`)}`;
}

export function newHubtelReference() {
  return `${HUBTEL_REFERENCE_PREFIX}${Date.now().toString(36)}-${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`.toUpperCase();
}

export async function createHubtelCheckout(input: {
  orderNumber: string;
  reference: string;
  amount: number;
  name: string;
  phone: string;
  email?: string | null;
}) {
  const { apiId, apiKey, account } = credentials();
  const baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "https://richdonscatering.com";
  const orderUrl = `${baseUrl.replace(/\/$/, "")}/pay/${encodeURIComponent(input.orderNumber)}`;
  const response = await fetch(HUBTEL_CHECKOUT_API, {
    method: "POST",
    headers: {
      Authorization: basicAuth(apiId, apiKey),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      totalAmount: Number(input.amount.toFixed(2)),
      description: `RD Order ${input.orderNumber}`,
      callbackUrl: `${baseUrl.replace(/\/$/, "")}/api/webhooks/hubtel`,
      returnUrl: orderUrl,
      cancellationUrl: orderUrl,
      merchantAccountNumber: account,
      clientReference: input.reference,
      payeeName: input.name,
      payeeMobileNumber: input.phone,
      ...(input.email ? { payeeEmail: input.email } : {}),
    }),
  });
  const result = await response.json().catch(() => null) as {
    responseCode?: string;
    message?: string;
    data?: { checkoutUrl?: string; checkoutDirectUrl?: string; clientReference?: string };
  } | null;
  if (!response.ok || result?.responseCode !== "0000" || result.data?.clientReference !== input.reference) {
    throw new Error(result?.message || `Hubtel checkout creation failed (${response.status}).`);
  }
  const checkoutUrl = result.data.checkoutDirectUrl || result.data.checkoutUrl;
  if (!checkoutUrl || !checkoutUrl.startsWith("https://pay.hubtel.com/")) {
    throw new Error("Hubtel did not return a valid checkout URL.");
  }
  return checkoutUrl;
}

type HubtelStatusResult = {
  responseCode?: string;
  data?: {
    status?: string;
    clientReference?: string;
    amount?: number;
    transactionId?: string;
    paymentMethod?: string;
  };
};

async function checkHubtelStatus(reference: string) {
  const { apiId, apiKey, account } = credentials();
  const url = new URL(`${HUBTEL_STATUS_API}/${encodeURIComponent(account)}/status`);
  url.searchParams.set("clientReference", reference);
  const response = await fetch(url, {
    headers: { Authorization: basicAuth(apiId, apiKey), Accept: "application/json" },
    cache: "no-store",
  });
  const result = await response.json().catch(() => null) as HubtelStatusResult | null;
  if (!response.ok || result?.responseCode !== "0000" || result.data?.clientReference !== reference) {
    throw new Error(`Hubtel status verification failed (${response.status}).`);
  }
  return result.data;
}

async function applyHubtelResult(reference: string, status: {
  status?: string;
  clientReference?: string;
  amount?: number;
  transactionId?: string;
  paymentMethod?: string;
}) {
  const payment = await prisma.payment.findFirst({
    where: {
      transactionId: reference,
      method: PaymentMethod.MOBILE_MONEY,
      status: PaymentStatus.PROCESSING,
    },
    include: { order: true },
  });
  if (!payment) return { found: false, completed: false };

  if (status.amount !== Number(payment.amount) || status.clientReference !== reference) {
    console.error("Hubtel payment details did not match the order", { orderNumber: payment.order.orderNumber });
    return { found: true, completed: false };
  }
  const nextStatus = status.status === "Paid"
    ? PaymentStatus.PAID
    : status.status === "Failed"
      ? PaymentStatus.FAILED
      : null;
  if (!nextStatus) return { found: true, completed: false };

  const updated = await prisma.payment.updateMany({
    where: { id: payment.id, status: PaymentStatus.PROCESSING, transactionId: reference },
    data: {
      status: nextStatus,
      ...(status.paymentMethod?.toLowerCase().includes("card") ? { method: PaymentMethod.CARD } : {}),
      ...(status.transactionId ? { providerTransactionId: status.transactionId } : {}),
    },
  });
  if (updated.count !== 1) return { found: true, completed: false };

  if (nextStatus === PaymentStatus.PAID) {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: "CONFIRMED" },
    }).catch((err) => {
      console.error("Failed to update order status to CONFIRMED on payment success:", err);
    });
  }

  return { found: true, completed: nextStatus === PaymentStatus.PAID };
}

export async function settleHubtelPayment(reference: string) {
  return applyHubtelResult(reference, (await checkHubtelStatus(reference)) || {});
}

export async function settleHubtelCallback(input: {
  reference: string;
  status: string;
  responseCode: string;
  amount?: number;
  transactionId?: string;
  paymentMethod?: string;
}) {
  const successful = input.responseCode === "0000" && input.status.toLowerCase() === "success";
  const failed = input.responseCode === "2001" && input.status.toLowerCase() === "failed";
  if (!successful && !failed) return { found: false, completed: false };
  return applyHubtelResult(input.reference, {
    clientReference: input.reference,
    status: successful ? "Paid" : "Failed",
    amount: input.amount,
    transactionId: input.transactionId,
    paymentMethod: input.paymentMethod,
  });
}

export function isTrustedHubtelCallback(request: Request) {
  if (process.env.HUBTEL_ENV === "sandbox") {
    return Boolean(request.headers.get("hubtel-signature"));
  }
  return request.headers.get("cf-connecting-ip") === "108.129.40.25";
}

export { HUBTEL_REFERENCE_PREFIX };
