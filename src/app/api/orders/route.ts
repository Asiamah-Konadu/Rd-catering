import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWhatsAppOrderUrl } from "@/lib/whatsapp";

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
      latitude?: unknown;
      longitude?: unknown;
      notes?: unknown;
      items?: unknown;
      isScheduled?: unknown;
      scheduledFor?: unknown;
      scheduledSlot?: unknown;
      promoCode?: unknown;
      companyId?: unknown;
      staffDepartment?: unknown;
    };

    const name = text(payload.name, MAX_NAME_LENGTH);
    const phone = text(payload.phone, MAX_PHONE_LENGTH);
    const email = text(payload.email, 150);
    const notes = text(payload.notes, MAX_NOTES_LENGTH);
    const companyId = typeof payload.companyId === "string" && payload.companyId.trim() ? payload.companyId.trim() : null;
    const staffDepartment = typeof payload.staffDepartment === "string" ? payload.staffDepartment.trim().slice(0, 100) : null;

    let company = null;
    if (companyId) {
      company = await prisma.company.findUnique({
        where: { id: companyId },
      });
      if (!company || !company.isActive) {
        return NextResponse.json(
          { error: "Selected corporate portal is inactive or not found." },
          { status: 400 }
        );
      }
    }

    let address = text(payload.address, MAX_ADDRESS_LENGTH);
    let city = text(payload.city, MAX_CITY_LENGTH);
    let region = text(payload.region, MAX_REGION_LENGTH);

    if (company) {
      if (!address) {
        address = company.dropoffLocation
          ? `${company.address} [${company.dropoffLocation}]`
          : company.address;
      }
      if (!city) city = company.city;
      if (!region) region = company.region || "Greater Accra";
    }

    const isScheduled = Boolean(payload.isScheduled) || Boolean(company);
    let scheduledFor: Date | null = null;
    let scheduledSlot: string | null = null;

    if (isScheduled) {
      if (typeof payload.scheduledSlot === "string" && payload.scheduledSlot.trim()) {
        scheduledSlot = payload.scheduledSlot.trim().slice(0, 100);
      } else if (company?.batchDeliveryTime) {
        scheduledSlot = `Corporate Lunch Batch (${company.batchDeliveryTime})`;
      } else {
        scheduledSlot = "Lunch (12:00 PM - 2:30 PM)";
      }

      if (typeof payload.scheduledFor === "string" && payload.scheduledFor) {
        const parsedDate = new Date(payload.scheduledFor);
        if (!isNaN(parsedDate.getTime())) {
          scheduledFor = parsedDate;
        }
      }

      if (!scheduledFor) {
        const today = new Date();
        // If ordered before 10:30 AM, can be delivered today, else tomorrow
        if (today.getHours() < 11) {
          scheduledFor = today;
        } else {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(12, 0, 0, 0);
          scheduledFor = tomorrow;
        }
      }
    }

    if (!getWhatsAppOrderUrl("WhatsApp checkout configuration check")) {
      return NextResponse.json(
        { error: "WhatsApp ordering is not configured. Please contact the restaurant directly." },
        { status: 503 }
      );
    }

    const latitude = typeof payload.latitude === "number" &&
      Number.isFinite(payload.latitude) &&
      payload.latitude >= -90 &&
      payload.latitude <= 90
      ? payload.latitude
      : null;
    const longitude = typeof payload.longitude === "number" &&
      Number.isFinite(payload.longitude) &&
      payload.longitude >= -180 &&
      payload.longitude <= 180
      ? payload.longitude
      : null;

    if (latitude === null || longitude === null) {
      return NextResponse.json(
        { error: "Pin your delivery location on the map using valid GPS coordinates." },
        { status: 400 }
      );
    }

    if (!name || name.length < 2 || !phone || !validPhone(phone) || !address || !city) {
      return NextResponse.json({ error: "Enter a valid name, Ghanaian phone number, address, and city." }, { status: 400 });
    }
    if (email && !validEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address or leave it blank." }, { status: 400 });
    }
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const requestedItems: Array<{
      id: string;
      quantity: unknown;
      extras?: unknown;
    } | null> = payload.items.map((item: unknown) => {
      if (!item || typeof item !== "object") return null;
      const candidate = item as { id?: unknown; quantity?: unknown; extras?: unknown };
      return {
        id: typeof candidate.id === "string" ? candidate.id : "",
        quantity: candidate.quantity,
        extras: Array.isArray(candidate.extras) ? candidate.extras : [],
      };
    });
    if (requestedItems.some(item => !item || !item.id || !Number.isInteger(item.quantity) || Number(item.quantity) < 1 || Number(item.quantity) > MAX_QUANTITY)) {
      return NextResponse.json({ error: `Each item quantity must be a whole number between 1 and ${MAX_QUANTITY}.` }, { status: 400 });
    }

    const menuItemIds = new Set<string>();
    const extraIds = new Set<string>();

    for (const item of requestedItems) {
      if (!item) continue;
      menuItemIds.add(item.id);
      if (Array.isArray(item.extras)) {
        for (const ex of item.extras) {
          if (ex && typeof ex === "object" && "id" in ex && typeof ex.id === "string") {
            extraIds.add(ex.id);
          }
        }
      }
    }

    const [menuItems, extrasDb] = await Promise.all([
      prisma.menuItem.findMany({ where: { id: { in: [...menuItemIds] } } }),
      extraIds.size > 0
        ? prisma.extra.findMany({ where: { id: { in: [...extraIds] } } })
        : Promise.resolve([]),
    ]);

    const menuById = new Map(menuItems.map(item => [item.id, item]));
    const extrasById = new Map(extrasDb.map(ex => [ex.id, ex]));

    const unavailableItem = [...menuItemIds].find(id => !menuById.get(id)?.isAvailable);
    if (unavailableItem) {
      return NextResponse.json({ error: "One of the items in your cart is no longer available. Please review your cart." }, { status: 409 });
    }

    const unavailableExtra = [...extraIds].find(id => !extrasById.get(id)?.isActive);
    if (unavailableExtra) {
      return NextResponse.json({ error: "One of the selected extras is currently unavailable. Please review your order." }, { status: 409 });
    }

    // Build order lines with accurate prices verified against DB
    const orderLines = requestedItems.map((req) => {
      if (!req) throw new Error("Invalid item in list");
      const item = menuById.get(req.id);
      if (!item) throw new Error("Menu item lookup failed");

      const selectedExtras: Array<{ id: string; name: string; price: number }> = [];
      if (Array.isArray(req.extras)) {
        for (const ex of req.extras) {
          if (ex && typeof ex === "object" && "id" in ex && typeof ex.id === "string") {
            const dbExtra = extrasById.get(ex.id);
            if (dbExtra) {
              selectedExtras.push({
                id: dbExtra.id,
                name: dbExtra.name,
                price: Number(dbExtra.price),
              });
            }
          }
        }
      }

      const basePrice = Number(item.price);
      const extrasSum = selectedExtras.reduce((sum, e) => sum + e.price, 0);
      const unitPrice = basePrice + extrasSum;
      const quantity = Number(req.quantity);
      const totalPrice = unitPrice * quantity;

      return {
        item,
        quantity,
        unitPrice,
        totalPrice,
        selectedExtras,
      };
    });

    const subtotal = orderLines.reduce((sum, line) => sum + line.totalPrice, 0);
    
    // Corporate batch orders can unlock free delivery
    const fee = company?.freeDelivery ? 0 : deliveryFee();

    const promoCodeRaw = typeof payload.promoCode === "string" ? payload.promoCode.trim().toUpperCase() : null;

    const result = await prisma.$transaction(async transaction => {
      let discount = 0;
      let validPromoCode: string | null = null;

      // Apply corporate discount percentage if active
      if (company && Number(company.discountPercent) > 0) {
        discount += (subtotal * Number(company.discountPercent)) / 100;
      }

      if (promoCodeRaw) {
        const promoEntry = await transaction.waitlistEntry.findUnique({
          where: { promoCode: promoCodeRaw },
        });

        if (!promoEntry) {
          throw new Error("Invalid promo code.");
        }
        if (promoEntry.isUsed) {
          throw new Error("This early-bird promo code has already been redeemed.");
        }

        // Free delivery perk: discount equals delivery fee if fee > 0
        if (fee > 0) {
          discount += fee;
        }
        validPromoCode = promoEntry.promoCode;
      }

      const finalTotal = Math.max(0, subtotal + fee - discount);

      const createdOrder = await transaction.order.create({
        data: {
          orderNumber: orderNumber(),
          companyId: company?.id || null,
          staffDepartment: staffDepartment || null,
          customerName: name,
          customerPhone: phone,
          customerEmail: email || null,
          subtotal,
          deliveryFee: fee,
          discount,
          total: finalTotal,
          promoCode: validPromoCode,
          notes: notes || null,
          isScheduled,
          scheduledFor,
          scheduledSlot,
          items: {
            create: orderLines.map(line => ({
              menuItemId: line.item.id,
              name: line.selectedExtras.length > 0 ? `${line.item.name} Combo` : line.item.name,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              totalPrice: line.totalPrice,
              ...(line.selectedExtras.length > 0
                ? {
                    extras: {
                      create: line.selectedExtras.map(ex => ({
                        extraId: ex.id,
                        price: ex.price,
                        quantity: 1,
                      })),
                    },
                  }
                : {}),
            })),
          },
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
          payment: {
            create: {
              amount: finalTotal,
              method: "WHATSAPP",
              status: "PENDING",
            },
          },
        },
        select: { id: true, orderNumber: true },
      });

      if (validPromoCode) {
        await transaction.waitlistEntry.update({
          where: { promoCode: validPromoCode },
          data: {
            isUsed: true,
            usedAt: new Date(),
            usedInOrderId: createdOrder.id,
          },
        });
      }

      return { order: createdOrder, finalTotal, discount };
    });

    const itemsSummary = orderLines.map(line => {
      const extrasDetail = line.selectedExtras.length > 0
        ? `\n   └ Extras: ${line.selectedExtras.map(e => `${e.name} (+GH₵ ${e.price.toFixed(2)})`).join(", ")}`
        : "";
      return `${line.quantity} x ${line.item.name} - GH₵ ${line.totalPrice.toFixed(2)}${extrasDetail}`;
    });

    const message = [
      "Hello Rich-Dons Catering, I would like to confirm this order:",
      `Order: ${result.order.orderNumber}`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      "",
      "Items:",
      ...itemsSummary,
      "",
      `Subtotal: GH₵ ${subtotal.toFixed(2)}`,
      `Delivery: GH₵ ${fee.toFixed(2)}`,
      `Discount: GH₵ ${result.discount.toFixed(2)}`,
      `Total: GH₵ ${result.finalTotal.toFixed(2)}`,
      `Delivery address: ${address}, ${city}${region ? `, ${region}` : ""}`,
      `Google Maps navigation: https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`,
      `GPS coordinates: ${latitude}, ${longitude}`,
      `Schedule: ${isScheduled ? `${scheduledSlot || "Scheduled"}${scheduledFor ? ` on ${scheduledFor.toLocaleString("en-GH")}` : ""}` : "ASAP"}`,
      ...(staffDepartment ? [`Department / desk: ${staffDepartment}`] : []),
      ...(notes ? [`Notes: ${notes}`] : []),
    ].join("\n");
    const whatsappUrl = getWhatsAppOrderUrl(message);

    if (!whatsappUrl) {
      return NextResponse.json(
        { error: "WhatsApp ordering is not configured. Please contact the restaurant directly." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { orderNumber: result.order.orderNumber, whatsappUrl },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Failed to create order:", err);
    const errorMessage = err instanceof Error ? err.message : "Unable to create your order right now. Please try again.";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
