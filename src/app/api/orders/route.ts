import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_QUANTITY = 50;
const MAX_NAME_LENGTH = 100;
const MAX_PHONE_LENGTH = 30;
const MAX_ADDRESS_LENGTH = 300;
const MAX_CITY_LENGTH = 100;
const MAX_REGION_LENGTH = 100;
const MAX_NOTES_LENGTH = 500;

function orderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
  return `RD-${date}-${suffix}`;
}

function text(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  const valueTrimmed = value.trim();
  return valueTrimmed.length <= maxLength ? valueTrimmed : "";
}

function validPhone(phone: string) {
  return /^[+\d][\d\s().-]{7,28}$/.test(phone);
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function deliveryFee() {
  return 20;
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid order request" }, { status: 400 });
    }
    const payload = body as {
      name?: unknown;
      phone?: unknown;
      email?: unknown;
      address?: unknown;
      city?: unknown;
      region?: unknown;
      notes?: unknown;
      items?: unknown;
    };

    const name = text(payload.name, MAX_NAME_LENGTH);
    const phone = text(payload.phone, MAX_PHONE_LENGTH);
    const email = text(payload.email, 150);
    const address = text(payload.address, MAX_ADDRESS_LENGTH);
    const city = text(payload.city, MAX_CITY_LENGTH);
    const region = text(payload.region, MAX_REGION_LENGTH);
    const notes = text(payload.notes, MAX_NOTES_LENGTH);

    const latitude = typeof (payload as { latitude?: unknown }).latitude === "number" && !isNaN(Number((payload as { latitude?: unknown }).latitude))
      ? Number((payload as { latitude?: unknown }).latitude)
      : null;
    const longitude = typeof (payload as { longitude?: unknown }).longitude === "number" && !isNaN(Number((payload as { longitude?: unknown }).longitude))
      ? Number((payload as { longitude?: unknown }).longitude)
      : null;

    if (!name || name.length < 2 || !phone || !validPhone(phone) || !address || !city) {
      return NextResponse.json({ error: "Enter a valid name, Ghanaian phone number, address, and city." }, { status: 400 });
    }
    if (email && !validEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address or leave it blank." }, { status: 400 });
    }
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const requestedItems: Array<{ id: string; quantity: unknown } | null> = payload.items.map((item: unknown) => {
      if (!item || typeof item !== "object") return null;
      const candidate = item as { id?: unknown; quantity?: unknown };
      return {
        id: typeof candidate.id === "string" ? candidate.id : "",
        quantity: candidate.quantity,
      };
    });
    if (requestedItems.some(item => !item || !item.id || !Number.isInteger(item.quantity) || Number(item.quantity) < 1 || Number(item.quantity) > MAX_QUANTITY)) {
      return NextResponse.json({ error: `Each item quantity must be a whole number between 1 and ${MAX_QUANTITY}.` }, { status: 400 });
    }

    const quantities = new Map<string, number>();
    for (const item of requestedItems) {
      if (!item) continue;
      const quantity = (quantities.get(item.id) ?? 0) + Number(item.quantity);
      if (quantity > MAX_QUANTITY) {
        return NextResponse.json({ error: `You can order up to ${MAX_QUANTITY} of each item.` }, { status: 400 });
      }
      quantities.set(item.id, quantity);
    }

    const menuItems = await prisma.menuItem.findMany({ where: { id: { in: [...quantities.keys()] } } });
    const menuById = new Map(menuItems.map(item => [item.id, item]));
    const unavailable = [...quantities.keys()].find(id => !menuById.get(id)?.isAvailable);
    if (unavailable) {
      return NextResponse.json({ error: "One of the items in your cart is no longer available. Please review your cart." }, { status: 409 });
    }

    const orderLines = [...quantities.entries()].map(([id, quantity]) => {
      const item = menuById.get(id);
      if (!item) throw new Error("Menu item lookup failed");
      const unitPrice = Number(item.price);
      return { item, quantity, unitPrice, totalPrice: unitPrice * quantity };
    });
    const subtotal = orderLines.reduce((sum, line) => sum + line.totalPrice, 0);
    const fee = deliveryFee();
    const total = subtotal + fee;
    const order = await prisma.$transaction(async transaction => transaction.order.create({
      data: {
        orderNumber: orderNumber(),
        customerName: name,
        customerPhone: phone,
        customerEmail: email || null,
        subtotal,
        deliveryFee: fee,
        total,
        notes: notes || null,
        items: { create: orderLines.map(line => ({
          menuItemId: line.item.id,
          name: line.item.name,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          totalPrice: line.totalPrice,
        })) },
        delivery: {
          create: {
            address,
            city,
            region: region || null,
            latitude,
            longitude,
            status: "PENDING",
          },
        },
        payment: { create: { amount: total, method: "CASH", status: "PENDING" } },
      },
      select: { orderNumber: true },
    }));
    return NextResponse.json({ orderNumber: order.orderNumber }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create your order right now. Please try again." }, { status: 500 });
  }
}
