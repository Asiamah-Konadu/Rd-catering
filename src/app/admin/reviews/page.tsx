import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { requireAnyRole } from "@/lib/authz";
import { ReviewsAdminClient } from "./ReviewsAdminClient";

export const dynamic = "force-dynamic";

export default async function ReviewsAdminPage() {
  const user = await requireAnyRole(["ADMIN"]);
  if (!user) redirect("/admin");

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        select: {
          orderNumber: true,
          customerName: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const formattedReviews = reviews.map((r) => ({
    id: r.id,
    orderId: r.orderId,
    rating: r.rating,
    comment: r.comment,
    isVisible: r.isVisible,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    order: {
      orderNumber: r.order.orderNumber,
      customerName: r.order.customerName,
    },
    user: r.user
      ? { name: r.user.name, email: r.user.email }
      : null,
  }));

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase">
            Customer Feedback
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Reviews Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor customer reviews, control visibility, and maintain platform quality.
          </p>
        </div>
      </div>

      <ReviewsAdminClient initialReviews={formattedReviews} />
    </main>
  );
}
