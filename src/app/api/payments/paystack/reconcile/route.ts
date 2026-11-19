import { NextResponse } from "next/server";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PAYSTACK_REFERENCE_PREFIX, settlePaystackPayment } from "@/lib/paystack";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.PAYMENT_RECONCILE_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payments = await prisma.payment.findMany({
    where: {
      status: PaymentStatus.PROCESSING,
      method: PaymentMethod.MOBILE_MONEY,
      transactionId: { startsWith: PAYSTACK_REFERENCE_PREFIX },
    },
    orderBy: { updatedAt: "asc" },
    take: 50,
  });

  let checked = 0;
  let completed = 0;
  for (const payment of payments) {
    if (!payment.transactionId) continue;
    checked++;
    try {
      const result = await settlePaystackPayment(payment.transactionId);
      if (result.completed) completed++;
    } catch (error) {
      console.error("Paystack payment reconciliation failed", { paymentId: payment.id, error });
    }
  }

  return NextResponse.json({ checked, completed });
}
