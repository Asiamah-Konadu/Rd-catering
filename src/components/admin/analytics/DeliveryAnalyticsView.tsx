"use client";

import React from "react";
import Link from "next/link";
import { MetricCard } from "./MetricCard";
import { ProgressBar } from "./ChartWidgets";
import type { TimeRange } from "@/lib/analytics";

interface DeliveryAnalyticsProps {
  data: {
    timeRange: TimeRange;
    totalAssigned: number;
    completedCount: number;
    inTransitCount: number;
    assignedCount: number;
    codCollected: number;
    cashPaidCount: number;
    digitalPaidCount: number;
    avgTransitMins: number;
    agentRating: number;
    totalReviews: number;
    recentDeliveries: Array<{
      id: string;
      orderNumber: string;
      customerName: string;
      address: string;
      city: string;
      status: string;
      paymentMethod: string;
      total: number;
    }>;
  };
  onTimeRangeChange?: (range: TimeRange) => void;
  isLoading?: boolean;
}

export function DeliveryAnalyticsView({
  data,
  onTimeRangeChange,
  isLoading,
}: DeliveryAnalyticsProps) {
  const timeRanges: { label: string; value: TimeRange }[] = [
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "7d" },
    { label: "Last 30 Days", value: "30d" },
    { label: "All Time", value: "all" },
  ];

  const totalDelivered = data.cashPaidCount + data.digitalPaidCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <span>🛵 Courier Driver Scorecard & Route Intelligence</span>
            {isLoading && (
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            )}
          </h2>
          <p className="text-xs text-slate-500">
            Personal delivery performance, transit speeds, and Cash on Delivery (COD) balance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range buttons */}
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

          <Link
            href="/admin/deliveries"
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1"
          >
            <span>Live Deliveries</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Driver Scorecard KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Completed Deliveries"
          value={data.completedCount}
          subtitle={`${data.inTransitCount} in transit | ${data.assignedCount} queued`}
          icon="📦"
          accentColor="emerald"
          badge={{
            text: "DELIVERED",
            type: "positive",
          }}
        />

        <MetricCard
          title="COD Cash to Remit"
          value={`GH₵ ${data.codCollected.toLocaleString()}`}
          subtitle={`${data.cashPaidCount} cash orders collected`}
          icon="💵"
          accentColor="amber"
          badge={{
            text: "CASH AT HAND",
            type: data.codCollected > 0 ? "warning" : "neutral",
          }}
        />

        <MetricCard
          title="Avg Transit Speed"
          value={`${data.avgTransitMins} mins`}
          subtitle="Pickup to doorstep duration"
          icon="⚡"
          accentColor="blue"
          badge={{
            text: "TRANSIT SLA",
            type: "positive",
          }}
        />

        <MetricCard
          title="Customer Rating"
          value={`★ ${data.agentRating}`}
          subtitle={`Based on ${data.totalReviews} customer ratings`}
          icon="⭐"
          accentColor="purple"
          badge={{
            text: "EXCELLENT",
            type: "positive",
          }}
        />
      </div>

      {/* Payment Settlement Split & Recent Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Remittance Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Payment Breakdown</h3>
            <p className="text-xs text-slate-400 mb-6">
              Cash collections vs cashless pre-paid deliveries
            </p>

            <div className="space-y-4">
              <ProgressBar
                label="💵 Cash on Delivery (Remit to Cashier)"
                value={data.cashPaidCount}
                total={totalDelivered}
                color="amber"
              />
              <ProgressBar
                label="📱 Digital Prepaid (MoMo / Card)"
                value={data.digitalPaidCount}
                total={totalDelivered}
                color="emerald"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6 bg-slate-50 p-4 rounded-xl text-center">
            <span className="text-xs text-slate-500 font-medium block">
              Total Cash to Drop off at Base
            </span>
            <strong className="text-2xl font-black text-amber-700 block mt-1">
              GH₵ {data.codCollected.toLocaleString()}
            </strong>
          </div>
        </div>

        {/* Recent Deliveries Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Recent Assigned Deliveries
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Latest drop-offs and routes handled
          </p>

          {data.recentDeliveries.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm italic">
              No delivery trips recorded for this timeframe.
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-slate-900">
                        #{delivery.orderNumber}
                      </strong>
                      <span className="text-xs text-slate-600 font-medium">
                        • {delivery.customerName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          delivery.status === "DELIVERED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {delivery.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      📍 {delivery.address}, {delivery.city}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs font-mono font-bold text-slate-900 block">
                      GH₵ {delivery.total.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">
                      {delivery.paymentMethod.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
