import { NextResponse } from "next/server";
import { isTrustedHubtelCallback, settleHubtelCallback } from "@/lib/hubtel";

export const runtime = "nodejs";

type HubtelCallback = {
  ResponseCode?: string;
  Status?: string;
  Data?: {
    ClientReference?: string;
    Amount?: number;
    CheckoutId?: string;
    PaymentDetails?: { PaymentType?: string };
  };
  responseCode?: string;
  status?: string;
  data?: { clientReference?: string; amount?: number; checkoutId?: string; paymentMethod?: string };
};

export async function POST(request: Request) {
  if (!isTrustedHubtelCallback(request)) {
    return NextResponse.json({ error: "Untrusted callback source" }, { status: 401 });
  }

  let payload: HubtelCallback;
  try {
    payload = await request.json() as HubtelCallback;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const responseCode = payload.ResponseCode || payload.responseCode || "";
  const status = payload.Status || payload.status || "";
  const reference = payload.Data?.ClientReference || payload.data?.clientReference || "";
  if (!/^HB-[A-Z0-9-]{10,29}$/.test(reference) || !status) {
    return NextResponse.json({ error: "Invalid payment callback" }, { status: 400 });
  }

  try {
    await settleHubtelCallback({
      reference,
      responseCode,
      status,
      amount: payload.Data?.Amount ?? payload.data?.amount,
      transactionId: payload.Data?.CheckoutId || payload.data?.checkoutId,
      paymentMethod: payload.Data?.PaymentDetails?.PaymentType || payload.data?.paymentMethod,
    });
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Hubtel callback could not be processed", { reference, error });
    return NextResponse.json({ error: "Callback processing failed" }, { status: 500 });
  }
}
