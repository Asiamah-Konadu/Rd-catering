import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_COMMENT_LENGTH = 500;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const { orderNumber } = await params;

  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const payload = body as { rating?: unknown; comment?: unknown };

    // Validate rating
    const rating = Number(payload.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be a whole number between 1 and 5." },
        { status: 400 }
      );
    }

    // Sanitise comment
    const rawComment =
      typeof payload.comment === "string" ? payload.comment.trim() : "";
    const comment =
      rawComment.length > 0 && rawComment.length <= MAX_COMMENT_LENGTH
        ? rawComment
        : rawComment.length > MAX_COMMENT_LENGTH
        ? null
        : null;

    // Look up the order
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: { id: true, status: true, review: { select: { id: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.status !== "DELIVERED") {
      return NextResponse.json(
        { error: "You can only rate a delivered order." },
        { status: 400 }
      );
    }

    if (order.review) {
      return NextResponse.json(
        { error: "You have already rated this order." },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: {
        orderId: order.id,
        userId: null,
        rating,
        comment: comment || null,
        isVisible: true,
      },
      select: { id: true, rating: true, comment: true, createdAt: true },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    console.error("Failed to create review:", err);
    return NextResponse.json(
      { error: "Unable to save your rating right now. Please try again." },
      { status: 500 }
    );
  }
}
