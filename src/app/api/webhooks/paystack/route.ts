import { NextResponse } from "next/server";
import { isValidPaystackSignature, settlePaystackPayment } from "@/lib/paystack";

export const runtime = "nodejs";

type PaystackWebhook = {
  event?: string;
  data?: { reference?: string };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!isValidPaystackSignature(rawBody, request.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let payload: PaystackWebhook;
  try {
    payload = JSON.parse(rawBody) as PaystackWebhook;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.event !== "charge.success" || !payload.data?.reference) {
    return NextResponse.json({ received: true });
  }

  try {
    await settlePaystackPayment(payload.data.reference);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook could not verify the transaction", {
      reference: payload.data.reference,
      error,
    });
    return NextResponse.json({ error: "Transaction verification failed; retry webhook" }, { status: 500 });
  }
}
