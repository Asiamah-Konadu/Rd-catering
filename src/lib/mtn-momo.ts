const DEFAULT_BASE_URL = "https://proxy.momoapi.mtn.com";

function config() {
  const baseUrl = (process.env.MTN_MOMO_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
  const apiUser = process.env.MTN_MOMO_API_USER;
  const apiKey = process.env.MTN_MOMO_API_KEY;
  const subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
  const targetEnvironment = process.env.MTN_MOMO_TARGET_ENVIRONMENT || "mtnghana";
  if (!apiUser || !apiKey || !subscriptionKey) throw new Error("MTN MoMo API credentials are not configured.");
  return { baseUrl, apiUser, apiKey, subscriptionKey, targetEnvironment };
}

async function accessToken() {
  const { baseUrl, apiUser, apiKey, subscriptionKey, targetEnvironment } = config();
  const response = await fetch(`${baseUrl}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiUser}:${apiKey}`).toString("base64")}`,
      "Ocp-Apim-Subscription-Key": subscriptionKey,
      "X-Target-Environment": targetEnvironment,
    },
  });
  const body = await response.json().catch(() => null) as { access_token?: string } | null;
  if (!response.ok || !body?.access_token) throw new Error(`MTN MoMo token request failed (${response.status}).`);
  return { token: body.access_token, ...config() };
}

export async function requestMtnMomoPayment(input: {
  referenceId: string;
  amount: string;
  phone: string;
  orderNumber: string;
}) {
  const { token, baseUrl, subscriptionKey, targetEnvironment } = await accessToken();
  const response = await fetch(`${baseUrl}/collection/v1_0/requesttopay`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": subscriptionKey,
      "X-Reference-Id": input.referenceId,
      "X-Target-Environment": targetEnvironment,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: "GHS",
      externalId: input.orderNumber,
      payer: { partyIdType: "MSISDN", partyId: input.phone },
      payerMessage: `Rich-Dons order ${input.orderNumber}`,
      payeeNote: `Food order ${input.orderNumber}`,
    }),
  });
  if (response.status !== 202) {
    const detail = await response.text().catch(() => "");
    throw new Error(`MTN MoMo request-to-pay failed (${response.status})${detail ? `: ${detail.slice(0, 300)}` : ""}`);
  }
}

export async function getMtnMomoPaymentStatus(referenceId: string) {
  const { token, baseUrl, subscriptionKey, targetEnvironment } = await accessToken();
  const response = await fetch(`${baseUrl}/collection/v1_0/requesttopay/${encodeURIComponent(referenceId)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": subscriptionKey,
      "X-Target-Environment": targetEnvironment,
    },
  });
  const body = await response.json().catch(() => null) as {
    status?: string;
    financialTransactionId?: string;
    reason?: { message?: string };
    amount?: string;
    currency?: string;
    externalId?: string;
  } | null;
  if (!response.ok || !body?.status) throw new Error(`MTN MoMo status request failed (${response.status}).`);
  return body;
}

export function normalizeGhanaPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (/^0\d{9}$/.test(digits)) return `233${digits.slice(1)}`;
  if (/^233\d{9}$/.test(digits)) return digits;
  return null;
}
