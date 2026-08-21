import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function orderNumber() {
  return `RD-${Date.now().toString().slice(-8)}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.phone || !body.address || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({error:"Missing required order details"}, {status:400});
    }
    const order = await prisma.order.create({
      data: {
        orderNumber: orderNumber(),
        customerName: body.name,
        customerPhone: body.phone,
        customerEmail: body.email || null,
        subtotal: body.subtotal,
        deliveryFee: body.deliveryFee ?? 0,
        total: body.total,
        notes: body.notes || null,
        items: { create: body.items.map((i:any) => ({
          name: i.name, quantity: i.quantity, unitPrice: i.price, totalPrice: i.price * i.quantity
        }))},
        delivery: { create: { address: body.address, city: body.city || "Accra", status: "PENDING" } },
        payment: { create: { amount: body.total, method: "CASH", status: "PENDING" } }
      }
    });
    return NextResponse.json({orderNumber: order.orderNumber});
  } catch (error) {
    console.error(error);
    return NextResponse.json({error:"Unable to create order"}, {status:500});
  }
}
