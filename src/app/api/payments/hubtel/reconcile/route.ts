import { NextResponse } from "next/server";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { HUBTEL_REFERENCE_PREFIX, settleHubtelPayment } from "@/lib/hubtel";

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
      transactionId: { startsWith: HUBTEL_REFERENCE_PREFIX },
      updatedAt: { lt: new Date(Date.now() - 5 * 60 * 1000) },
    },
    orderBy: { updatedAt: "asc" },
    take: 30,
  });

  let checked = 0;
  let completed = 0;
  let failed = 0;
  for (const payment of payments) {
    if (!payment.transactionId) continue;
    checked++;
    try {
      const result = await settleHubtelPayment(payment.transactionId);
      if (result.completed) completed++;
    } catch (error) {
      failed++;
      console.error("Hubtel payment reconciliation failed", { paymentId: payment.id, error });
    }
  }
  return NextResponse.json({ checked, completed, failed });
}
