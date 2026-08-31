"use client";

import React, { useState } from "react";
import { MetricCard } from "./MetricCard";
import { TrendBarChart, ProgressBar } from "./ChartWidgets";
import type { TimeRange } from "@/lib/analytics";

interface AdminAnalyticsProps {
  data: {
    timeRange: TimeRange;
    totalRevenue: number;
    averageOrderValue: number;
    totalOrders: number;
    completedOrders: number;
    activeOrders: number;
    cancelledOrders: number;
    paymentMethods: {
      MOBILE_MONEY: number;
      CARD: number;
      CASH: number;
    };
    paymentStatuses: {
      PAID: number;
      PENDING: number;
      FAILED_REFUNDED: number;
    };
    dailyTrend: Array<{
      date: string;
      label: string;
      revenue: number;
      orders: number;
    }>;
    topDishes: Array<{
      name: string;
      quantity: number;
      revenue: number;
    }>;
    avgRating: number;
    totalReviews: number;
    avgDeliveryMinutes: number;
  };
  onTimeRangeChange?: (range: TimeRange) => void;
  isLoading?: boolean;
}

export function AdminAnalyticsView({
  data,
  onTimeRangeChange,
  isLoading,
}: AdminAnalyticsProps) {
  const [chartMetric, setChartMetric] = useState<"revenue" | "orders">("revenue");
  const timeRanges: { label: string; value: TimeRange }[] = [
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "7d" },
    { label: "Last 30 Days", value: "30d" },
    { label: "All Time", value: "all" },
  ];

  const totalPayments =
    data.paymentMethods.MOBILE_MONEY +
    data.paymentMethods.CARD +
    data.paymentMethods.CASH;

  return (
    <div className="space-y-6">
      {/* Header controls & Time Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <span>📊 Executive Intelligence & Analytics</span>
            {isLoading && (
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </h2>
          <p className="text-xs text-slate-500">
            Real-time financial performance, sales trajectory, and operations overview.
          </p>
        </div>

        {/* Time range selector pill buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => onTimeRangeChange?.(range.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                data.timeRange === range.value
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`GH₵ ${data.totalRevenue.toLocaleString()}`}
          subtitle={`${data.completedOrders} orders settled`}
          icon="💰"
          accentColor="amber"
          badge={{
            text: data.timeRange.toUpperCase(),
            type: "positive",
          }}
        />

        <MetricCard
          title="Average Order Value"
          value={`GH₵ ${data.averageOrderValue.toFixed(2)}`}
          subtitle="Revenue per customer order"
          icon="🏷️"
          accentColor="blue"
        />

        <MetricCard
          title="Total Volume"
          value={data.totalOrders}
          subtitle={`${data.activeOrders} active | ${data.cancelledOrders} cancelled`}
          icon="📦"
          accentColor="emerald"
          badge={{
            text: `${data.totalOrders > 0 ? Math.round((data.completedOrders / data.totalOrders) * 100) : 100}% fulfillment`,
            type: "neutral",
          }}
        />

        <MetricCard
          title="Avg Delivery Speed"
          value={`${data.avgDeliveryMinutes} mins`}
          subtitle={`★ ${data.avgRating} / 5 (${data.totalReviews} reviews)`}
          icon="⚡"
          accentColor="purple"
          badge={{
            text: "Transit SLA",
            type: "positive",
          }}
        />
      </div>

      {/* Charts & Deep-Dive Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Revenue Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Revenue & Sales Trajectory
              </h3>
              <p className="text-xs text-slate-400">
                Daily transaction volume across the selected period
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setChartMetric("revenue")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  chartMetric === "revenue"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500"
                }`}
              >
                Revenue (GH₵)
              </button>
              <button
                onClick={() => setChartMetric("orders")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  chartMetric === "orders"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500"
                }`}
              >
                Orders Count
              </button>
            </div>
          </div>

          <TrendBarChart data={data.dailyTrend} metricType={chartMetric} />
        </div>

        {/* Payment Methods & Settlement Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Payment Breakdown</h3>
            <p className="text-xs text-slate-400 mb-6">
              Distribution of customer payment channels
            </p>

            <div className="space-y-4">
              <ProgressBar
                label="📱 Mobile Money (MoMo)"
                value={data.paymentMethods.MOBILE_MONEY}
                total={totalPayments}
                color="amber"
              />
              <ProgressBar
                label="💳 Card Payment"
                value={data.paymentMethods.CARD}
                total={totalPayments}
                color="blue"
              />
              <ProgressBar
                label="💵 Cash on Delivery"
                value={data.paymentMethods.CASH}
                total={totalPayments}
                color="emerald"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6 grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-bold uppercase block">
                Paid / Settled
              </span>
              <strong className="text-emerald-600 font-extrabold text-lg">
                {data.paymentStatuses.PAID}
              </strong>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-bold uppercase block">
                Unpaid / Pending
              </span>
              <strong className="text-amber-600 font-extrabold text-lg">
                {data.paymentStatuses.PENDING}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Best-Selling Dishes Leaderboard */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Top-Selling Menu Dishes
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Highest velocity meals and gross revenue contributions
        </p>

        {data.topDishes.length === 0 ? (
          <div className="text-sm text-slate-400 py-6 text-center italic">
            No order items recorded in this timeframe.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase text-slate-400 font-semibold">
                  <th className="pb-3 pl-2">#</th>
                  <th className="pb-3">Dish / Menu Item</th>
                  <th className="pb-3 text-right">Units Sold</th>
                  <th className="pb-3 text-right pr-2">Gross Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {data.topDishes.map((dish, index) => (
                  <tr key={dish.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 pl-2 font-bold text-slate-400 text-xs">
                      #{index + 1}
                    </td>
                    <td className="py-3 font-semibold text-slate-800">
                      {dish.name}
                    </td>
                    <td className="py-3 text-right font-mono text-slate-600 font-semibold">
                      {dish.quantity}x
                    </td>
                    <td className="py-3 text-right pr-2 font-mono font-bold text-amber-700">
                      GH₵ {dish.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
