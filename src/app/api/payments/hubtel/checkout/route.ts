import { NextResponse } from "next/server";
import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createHubtelCheckout, newHubtelReference } from "@/lib/hubtel";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const orderNumber = new URL(request.url).searchParams.get("orderNumber")?.toUpperCase();
  if (!orderNumber || !/^RD-\d{8}-[A-F0-9]{8,32}$/.test(orderNumber)) {
    return NextResponse.json({ error: "Invalid order reference." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: {
      orderNumber: true,
      status: true,
      customerName: true,
      customerPhone: true,
      customerEmail: true,
      payment: { select: { id: true, amount: true, status: true, transactionId: true, checkoutUrl: true } },
    },
  });
  if (!order?.payment) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.payment.status === PaymentStatus.PAID) {
    return NextResponse.json({ status: "PAID", amount: order.payment.amount.toFixed(2) }, { headers: { "Cache-Control": "no-store" } });
  }
  if (order.payment.status === PaymentStatus.FAILED) {
    return NextResponse.json({ status: "FAILED", amount: order.payment.amount.toFixed(2) }, { headers: { "Cache-Control": "no-store" } });
  }
  if (!order.payment.checkoutUrl) {
    return NextResponse.json({ error: "Payment checkout has not been prepared yet." }, { status: 409 });
  }
  return NextResponse.json({
    status: order.payment.status,
    amount: order.payment.amount.toFixed(2),
    checkoutUrl: order.payment.checkoutUrl,
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  let payload: { orderNumber?: unknown };
  try {
    payload = await request.json() as { orderNumber?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const orderNumber = typeof payload.orderNumber === "string" ? payload.orderNumber.toUpperCase() : "";
  if (!/^RD-\d{8}-[A-F0-9]{8,32}$/.test(orderNumber)) {
    return NextResponse.json({ error: "Invalid order reference." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { payment: true },
  });
  if (!order?.payment) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.status === "CANCELLED") return NextResponse.json({ error: "This order was cancelled." }, { status: 409 });
  if (order.payment.status === PaymentStatus.PAID) {
    return NextResponse.json({ status: "PAID" }, { headers: { "Cache-Control": "no-store" } });
  }
  if (order.payment.status === PaymentStatus.PROCESSING) {
    if (order.payment.checkoutUrl) {
      return NextResponse.json({ status: "PROCESSING", checkoutUrl: order.payment.checkoutUrl });
    }
    return NextResponse.json({ error: "Checkout is being prepared. Refresh this page in a moment." }, { status: 409 });
  }

  const reference = newHubtelReference();
  const claim = await prisma.payment.updateMany({
    where: { id: order.payment.id, status: { in: [PaymentStatus.PENDING, PaymentStatus.FAILED] } },
    data: {
      status: PaymentStatus.PROCESSING,
      method: "MOBILE_MONEY",
      transactionId: reference,
      checkoutUrl: null,
    },
  });
  if (claim.count !== 1) {
    return NextResponse.json({ error: "Checkout is already being prepared. Refresh this page in a moment." }, { status: 409 });
  }

  try {
    const checkoutUrl = await createHubtelCheckout({
      orderNumber,
      reference,
      amount: Number(order.payment.amount),
      name: order.customerName,
      phone: order.customerPhone,
      email: order.customerEmail,
    });
    const saved = await prisma.payment.updateMany({
      where: { id: order.payment.id, status: PaymentStatus.PROCESSING, transactionId: reference },
      data: { checkoutUrl },
    });
    if (saved.count !== 1) throw new Error("The payment state changed before checkout was saved.");
    return NextResponse.json({ status: "PROCESSING", checkoutUrl }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Could not create Hubtel Online Checkout", { orderNumber, error });
    await prisma.payment.updateMany({
      where: { id: order.payment.id, status: PaymentStatus.PROCESSING, transactionId: reference, checkoutUrl: null },
      data: { status: PaymentStatus.FAILED },
    });
    return NextResponse.json({ error: "We couldn't start the secure checkout. Please try again." }, { status: 502 });
  }
}
