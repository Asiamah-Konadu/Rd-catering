import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus, DeliveryStatus, PaymentMethod } from "@prisma/client";

export type TimeRange = "today" | "7d" | "30d" | "all";

export function getDateFilter(range: TimeRange = "7d"): Date | null {
  const now = new Date();
  if (range === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  if (range === "7d") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  if (range === "30d") {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  return null;
}

// -------------------------------------------------------------
// 1. ADMIN (EXECUTIVE) ANALYTICS
// -------------------------------------------------------------
export async function getAdminAnalytics(timeRange: TimeRange = "7d") {
  const startDate = getDateFilter(timeRange);
  const dateWhere = startDate ? { createdAt: { gte: startDate } } : {};

  const paidCondition = {
    OR: [
      { payment: { status: PaymentStatus.PAID } },
      { status: OrderStatus.DELIVERED },
    ] as object[],
  };

  const [
    totalOrders,
    completedOrders,
    activeOrders,
    cancelledOrders,
    revenueAgg,
    paidCount,
    mmCount,
    cardCount,
    cashCount,
    waCount,
    statusPaid,
    statusPending,
    statusFailedRefunded,
    trendRows,
    topDishesRaw,
    reviewsAgg,
    deliveryRows,
  ] = await Promise.all([
    // --- counts ---
    prisma.order.count({ where: dateWhere }),
    prisma.order.count({ where: { ...dateWhere, status: OrderStatus.DELIVERED } }),
    prisma.order.count({
      where: {
        ...dateWhere,
        status: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY] },
      },
    }),
    prisma.order.count({ where: { ...dateWhere, status: OrderStatus.CANCELLED } }),

    // --- revenue aggregate ---
    prisma.order.aggregate({
      where: { ...dateWhere, ...paidCondition },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { ...dateWhere, ...paidCondition } }),

    // --- payment method counts ---
    prisma.order.count({ where: { ...dateWhere, payment: { method: PaymentMethod.MOBILE_MONEY } } }),
    prisma.order.count({ where: { ...dateWhere, payment: { method: PaymentMethod.CARD } } }),
    prisma.order.count({ where: { ...dateWhere, payment: { method: PaymentMethod.CASH } } }),
    prisma.order.count({ where: { ...dateWhere, payment: { method: PaymentMethod.WHATSAPP } } }),

    // --- payment status counts ---
    prisma.order.count({ where: { ...dateWhere, payment: { status: PaymentStatus.PAID } } }),
    prisma.order.count({
      where: {
        ...dateWhere,
        OR: [{ payment: { status: PaymentStatus.PENDING } }, { payment: null }] as object[],
      },
    }),
    prisma.order.count({
      where: {
        ...dateWhere,
        OR: [
          { payment: { status: PaymentStatus.FAILED } },
          { payment: { status: PaymentStatus.REFUNDED } },
        ] as object[],
      },
    }),

    // --- daily trend: minimal select, bounded by time range ---
    prisma.order.findMany({
      where: dateWhere,
      select: {
        createdAt: true,
        total: true,
        status: true,
        payment: { select: { status: true } },
      },
      orderBy: { createdAt: "asc" },
    }),

    // --- top dishes via groupBy ---
    prisma.orderItem.groupBy({
      by: ["name"],
      where: { order: { ...dateWhere, status: { not: OrderStatus.CANCELLED } } },
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),

    // --- reviews aggregate ---
    prisma.review.aggregate({
      where: { isVisible: true },
      _avg: { rating: true },
      _count: { _all: true },
    }),

    // --- delivery times: bounded by take:100 ---
    prisma.delivery.findMany({
      where: {
        status: DeliveryStatus.DELIVERED,
        assignedAt: { not: null },
        deliveredAt: { not: null },
        ...(startDate ? { deliveredAt: { gte: startDate } } : {}),
      },
      select: { assignedAt: true, deliveredAt: true },
      take: 100,
    }),
  ]);

  // Revenue & average order value
  const totalRevenue = Number(revenueAgg._sum.total ?? 0);
  const averageOrderValue = paidCount > 0 ? totalRevenue / paidCount : 0;

  // Payment method & status breakdowns
  const paymentMethods = {
    MOBILE_MONEY: mmCount,
    CARD: cardCount,
    CASH: cashCount,
    WHATSAPP: waCount,
  };

  const paymentStatuses = {
    PAID: statusPaid,
    PENDING: statusPending,
    FAILED_REFUNDED: statusFailedRefunded,
  };

  // Daily trend buckets (built from minimal-field rows)
  const dailyBuckets: { [key: string]: { label: string; revenue: number; orders: number } } = {};
  trendRows.forEach((o) => {
    const key = o.createdAt.toISOString().slice(0, 10);
    const label = new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!dailyBuckets[key]) {
      dailyBuckets[key] = { label, revenue: 0, orders: 0 };
    }
    dailyBuckets[key].orders += 1;
    if (o.payment?.status === PaymentStatus.PAID || o.status === OrderStatus.DELIVERED) {
      dailyBuckets[key].revenue += Number(o.total ?? 0);
    }
  });

  const dailyTrend = Object.keys(dailyBuckets)
    .sort()
    .map((k) => ({
      date: k,
      label: dailyBuckets[k].label,
      revenue: Math.round(dailyBuckets[k].revenue * 100) / 100,
      orders: dailyBuckets[k].orders,
    }));

  // Top dishes from groupBy result
  const topDishes = topDishesRaw.map((row) => ({
    name: row.name,
    quantity: row._sum.quantity ?? 0,
    revenue: Math.round(Number(row._sum.totalPrice ?? 0) * 100) / 100,
  }));

  // Reviews
  const avgRating = reviewsAgg._avg.rating ?? 5.0;
  const totalReviews = reviewsAgg._count._all;

  // Average delivery minutes
  let totalDeliveryMinutes = 0;
  let deliveredCount = 0;
  deliveryRows.forEach((d) => {
    if (d.assignedAt && d.deliveredAt) {
      const diffMs = new Date(d.deliveredAt).getTime() - new Date(d.assignedAt).getTime();
      if (diffMs > 0) {
        totalDeliveryMinutes += diffMs / (1000 * 60);
        deliveredCount += 1;
      }
    }
  });
  const avgDeliveryMinutes = deliveredCount > 0 ? Math.round(totalDeliveryMinutes / deliveredCount) : 28;

  return {
    timeRange,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    totalOrders,
    completedOrders,
    activeOrders,
    cancelledOrders,
    paymentMethods,
    paymentStatuses,
    dailyTrend,
    topDishes,
    avgRating: Math.round(avgRating * 10) / 10,
    totalReviews,
    avgDeliveryMinutes,
  };
}

// -------------------------------------------------------------
// 2. ORDER_HANDLER (KITCHEN & OPERATIONS) ANALYTICS
// -------------------------------------------------------------
export async function getKitchenAnalytics() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // 1. Live orders in pipeline
  const activeOrders = await prisma.order.findMany({
    where: {
      status: {
        in: [
          OrderStatus.PENDING,
          OrderStatus.CONFIRMED,
          OrderStatus.PREPARING,
          OrderStatus.READY,
          OrderStatus.OUT_FOR_DELIVERY,
        ],
      },
    },
    include: {
      items: {
        include: { extras: { include: { extra: true } } },
      },
      delivery: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const pendingConfirmation = activeOrders.filter((o) => o.status === OrderStatus.PENDING);
  const inPreparation = activeOrders.filter((o) => o.status === OrderStatus.PREPARING);
  const confirmedQueue = activeOrders.filter((o) => o.status === OrderStatus.CONFIRMED);
  const readyForDispatch = activeOrders.filter((o) => o.status === OrderStatus.READY);
  const outForDelivery = activeOrders.filter((o) => o.status === OrderStatus.OUT_FOR_DELIVERY);

  // Delayed orders in preparation > 30 minutes
  const now = new Date().getTime();
  const delayedOrders = activeOrders.filter((o) => {
    if (o.status === OrderStatus.PREPARING || o.status === OrderStatus.CONFIRMED) {
      const orderAgeMinutes = (now - new Date(o.createdAt).getTime()) / (1000 * 60);
      return orderAgeMinutes > 30;
    }
    return false;
  });

  // Batch Item Demand Board (Items currently in queue to prepare/cook)
  const cookingItemsMap: { [name: string]: { name: string; quantity: number; notes: string[] } } = {};
  [...confirmedQueue, ...inPreparation].forEach((order) => {
    order.items.forEach((item) => {
      if (!cookingItemsMap[item.name]) {
        cookingItemsMap[item.name] = { name: item.name, quantity: 0, notes: [] };
      }
      cookingItemsMap[item.name].quantity += item.quantity;
      if (order.notes && !cookingItemsMap[item.name].notes.includes(order.notes)) {
        cookingItemsMap[item.name].notes.push(order.notes);
      }
    });
  });

  const batchCookingQueue = Object.values(cookingItemsMap).sort((a, b) => b.quantity - a.quantity);

  // Today's completed and cancelled counts
  const [todayCompletedCount, todayCancelledCount, todayTotalCount] = await Promise.all([
    prisma.order.count({
      where: {
        createdAt: { gte: startOfDay },
        status: OrderStatus.DELIVERED,
      },
    }),
    prisma.order.count({
      where: {
        createdAt: { gte: startOfDay },
        status: OrderStatus.CANCELLED,
      },
    }),
    prisma.order.count({
      where: {
        createdAt: { gte: startOfDay },
      },
    }),
  ]);

  return {
    pipeline: {
      pending: pendingConfirmation.length,
      confirmed: confirmedQueue.length,
      preparing: inPreparation.length,
      ready: readyForDispatch.length,
      outForDelivery: outForDelivery.length,
      totalActive: activeOrders.length,
    },
    delayedCount: delayedOrders.length,
    delayedOrders: delayedOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      status: o.status,
      minutesWaiting: Math.round((now - new Date(o.createdAt).getTime()) / (1000 * 60)),
    })),
    batchCookingQueue,
    todayStats: {
      total: todayTotalCount,
      completed: todayCompletedCount,
      cancelled: todayCancelledCount,
      completionRate:
        todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 100,
    },
  };
}

// -------------------------------------------------------------
// 3. MENU_MANAGER (CATALOG & PRODUCT) ANALYTICS
// -------------------------------------------------------------
export async function getMenuManagerAnalytics() {
  const [categories, totalMenuItems, activeMenuItems, unavailableMenuItems, orderItemsRaw, weeklySpecialCount, extrasRaw] =
    await Promise.all([
      prisma.category.findMany({
        include: {
          menuItems: {
            select: { id: true, isAvailable: true, price: true },
          },
        },
      }),
      prisma.menuItem.count(),
      prisma.menuItem.count({ where: { isAvailable: true } }),
      prisma.menuItem.count({ where: { isAvailable: false } }),
      // groupBy: get top 11 so we can split top-6 and low-5 without loading all rows
      prisma.orderItem.groupBy({
        by: ["name"],
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 11,
      }),
      prisma.weeklyMenuItem.count(),
      // bounded extras: select only needed fields, capped at 500 rows
      prisma.orderItemExtra.findMany({
        select: {
          extraId: true,
          quantity: true,
          extra: { select: { name: true } },
        },
        take: 500,
      }),
    ]);

  // Build velocity list from groupBy result
  const sortedDishes = orderItemsRaw.map((row) => ({
    name: row.name,
    quantity: row._sum.quantity ?? 0,
    revenue: Math.round(Number(row._sum.totalPrice ?? 0) * 100) / 100,
  }));

  const topDishes = sortedDishes.slice(0, 6);
  // For low demand we need ascending order — re-sort the fetched slice
  const lowDemandDishes =
    sortedDishes.length > 6
      ? [...sortedDishes].sort((a, b) => a.quantity - b.quantity).slice(0, 5)
      : [];

  // Category coverage
  const categoryStats = categories.map((cat) => ({
    name: cat.name,
    totalItems: cat.menuItems.length,
    activeItems: cat.menuItems.filter((i) => i.isAvailable).length,
    inactiveItems: cat.menuItems.filter((i) => !i.isAvailable).length,
  }));

  // Popular Extras/Add-ons (from bounded findMany)
  const extraCounts: { [name: string]: { name: string; count: number } } = {};
  extrasRaw.forEach((e) => {
    const name = e.extra?.name || "Extra Add-on";
    if (!extraCounts[name]) extraCounts[name] = { name, count: 0 };
    extraCounts[name].count += e.quantity;
  });

  const topExtras = Object.values(extraCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    catalogHealth: {
      total: totalMenuItems,
      active: activeMenuItems,
      unavailable: unavailableMenuItems,
      availabilityRate: totalMenuItems > 0 ? Math.round((activeMenuItems / totalMenuItems) * 100) : 100,
      weeklySpecialCount,
    },
    categoryStats,
    topDishes,
    lowDemandDishes,
    topExtras,
  };
}

// -------------------------------------------------------------
// 4. DELIVERY_AGENT (PERSONAL DRIVER SCORECARD) ANALYTICS
// -------------------------------------------------------------
export async function getDeliveryAgentAnalytics(agentId: string, timeRange: TimeRange = "today") {
  const startDate = getDateFilter(timeRange);
  const dateFilter = startDate ? { assignedAt: { gte: startDate } } : {};

  const deliveries = await prisma.delivery.findMany({
    where: {
      agentId,
      ...dateFilter,
    },
    include: {
      order: {
        include: {
          payment: true,
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  const completed = deliveries.filter((d) => d.status === DeliveryStatus.DELIVERED);
  const inTransit = deliveries.filter(
    (d) => d.status === DeliveryStatus.IN_TRANSIT || d.status === DeliveryStatus.PICKED_UP
  );
  const assigned = deliveries.filter((d) => d.status === DeliveryStatus.ASSIGNED);

  // Cash on Delivery (COD) Collected
  let codCollected = 0;
  let digitalPaidCount = 0;
  let cashPaidCount = 0;

  completed.forEach((d) => {
    if (d.order?.payment?.method === PaymentMethod.CASH) {
      codCollected += Number(d.order.total || 0);
      cashPaidCount += 1;
    } else {
      digitalPaidCount += 1;
    }
  });

  // Calculate average transit duration in minutes
  let totalTransitMinutes = 0;
  let validTransitTrips = 0;
  completed.forEach((d) => {
    if (d.assignedAt && d.deliveredAt) {
      const mins = (new Date(d.deliveredAt).getTime() - new Date(d.assignedAt).getTime()) / (1000 * 60);
      if (mins > 0 && mins < 240) {
        totalTransitMinutes += mins;
        validTransitTrips += 1;
      }
    }
  });

  const avgTransitMins = validTransitTrips > 0 ? Math.round(totalTransitMinutes / validTransitTrips) : 22;

  // Rating score for delivered orders
  const deliveredOrderIds = completed.map((d) => d.orderId);
  const reviews = await prisma.review.findMany({
    where: {
      orderId: { in: deliveredOrderIds },
    },
    select: { rating: true },
  });

  const agentRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : 5.0;

  return {
    timeRange,
    totalAssigned: deliveries.length,
    completedCount: completed.length,
    inTransitCount: inTransit.length,
    assignedCount: assigned.length,
    codCollected: Math.round(codCollected * 100) / 100,
    cashPaidCount,
    digitalPaidCount,
    avgTransitMins,
    agentRating,
    totalReviews: reviews.length,
    recentDeliveries: deliveries.slice(0, 5).map((d) => ({
      id: d.id,
      orderNumber: d.order?.orderNumber || "ORD",
      customerName: d.order?.customerName || "Customer",
      address: d.address,
      city: d.city,
      status: d.status,
      paymentMethod: d.order?.payment?.method || "CASH",
      total: Number(d.order?.total || 0),
    })),
  };
}
