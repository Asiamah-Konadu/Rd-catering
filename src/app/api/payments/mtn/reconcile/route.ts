import { NextResponse } from "next/server";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getMtnMomoPaymentStatus, normalizeGhanaPhone } from "@/lib/mtn-momo";
import { sendWhatsAppTemplate, sendWhatsAppText } from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.PAYMENT_RECONCILE_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payments = await prisma.payment.findMany({
    where: { status: PaymentStatus.PROCESSING, method: PaymentMethod.MOBILE_MONEY, transactionId: { not: null } },
    include: { order: true },
    orderBy: { updatedAt: "asc" },
    take: 50,
  });

  let checked = 0;
  let completed = 0;
  for (const payment of payments) {
    if (!payment.transactionId) continue;
    checked++;
    try {
      const result = await getMtnMomoPaymentStatus(payment.transactionId);
      if (result.status !== "SUCCESSFUL" && result.status !== "FAILED") {
        // Move still-pending entries behind newer ones so batches larger than 50 are not starved.
        await prisma.payment.updateMany({
          where: { id: payment.id, status: PaymentStatus.PROCESSING, transactionId: payment.transactionId },
          data: { updatedAt: new Date() },
        });
        continue;
      }
      if (result.externalId !== payment.order.orderNumber || result.currency !== "GHS" || Number(result.amount) !== Number(payment.amount)) {
        console.error("MTN MoMo status details did not match the order", { orderNumber: payment.order.orderNumber });
        continue;
      }

      const nextStatus = result.status === "SUCCESSFUL" ? PaymentStatus.PAID : PaymentStatus.FAILED;
      const updated = await prisma.payment.updateMany({
        where: { id: payment.id, status: PaymentStatus.PROCESSING, transactionId: payment.transactionId },
        data: { status: nextStatus, transactionId: result.financialTransactionId || payment.transactionId },
      });
      if (updated.count !== 1) continue;

      const customer = normalizeGhanaPhone(payment.order.customerPhone);
      if (customer) {
        const text = nextStatus === PaymentStatus.PAID
          ? `Payment confirmed for order ${payment.order.orderNumber}. We received GH₵ ${payment.amount.toFixed(2)}. Thank you for ordering with Rich-Dons Catering.`
          : `The MTN MoMo payment for order ${payment.order.orderNumber} was not completed. Please contact Rich-Dons Catering if you would like another payment request.`;
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
            // Payment state is authoritative even if WhatsApp is temporarily unavailable.
            console.error("Payment status saved but WhatsApp confirmation failed", { orderNumber: payment.order.orderNumber, error });
          }
        }
      }
      if (nextStatus === PaymentStatus.PAID) completed++;
    } catch (error) {
      console.error("MTN MoMo reconciliation failed", { orderNumber: payment.order.orderNumber, error });
    }
  }

  return NextResponse.json({ checked, completed });
}
