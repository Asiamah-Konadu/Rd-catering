"use client";

import React from "react";
import Link from "next/link";
import { MetricCard } from "./MetricCard";
import { ProgressBar } from "./ChartWidgets";

interface KitchenAnalyticsProps {
  data: {
    pipeline: {
      pending: number;
      confirmed: number;
      preparing: number;
      ready: number;
      outForDelivery: number;
      totalActive: number;
    };
    delayedCount: number;
    delayedOrders: Array<{
      id: string;
      orderNumber: string;
      customerName: string;
      status: string;
      minutesWaiting: number;
    }>;
    batchCookingQueue: Array<{
      name: string;
      quantity: number;
      notes: string[];
    }>;
    todayStats: {
      total: number;
      completed: number;
      cancelled: number;
      completionRate: number;
    };
  };
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function KitchenAnalyticsView({
  data,
  onRefresh,
  isLoading,
}: KitchenAnalyticsProps) {
  return (
    <div className="space-y-6">
      {/* Header & Live Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <span>🍳 Kitchen & Floor Throughput Intelligence</span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time kitchen order funnel, batch demand aggregation, and SLA delays.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span className={isLoading ? "animate-spin" : ""}>🔄</span>
            <span>Refresh Queue</span>
          </button>
          <Link
            href="/admin/orders"
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1"
          >
            <span>Go to Live Orders</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Delayed Orders Warning Banner */}
      {data.delayedCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 text-rose-900 shadow-xs animate-pulse">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-rose-900">
                SLA Warning: {data.delayedCount} Order{data.delayedCount > 1 ? "s" : ""} Exceeding 30-Minute Kitchen Threshold!
              </h3>
              <p className="text-xs text-rose-700 mt-1">
                The following orders require immediate culinary attention or dispatch status update:
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {data.delayedOrders.map((order) => (
                  <span
                    key={order.id}
                    className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-rose-200 text-xs font-semibold text-rose-800"
                  >
                    <strong>#{order.orderNumber}</strong> ({order.customerName}) —
                    <span className="text-rose-600 font-bold">{order.minutesWaiting}m waiting</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Live Order Pipeline Funnel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          title="1. Pending Acceptance"
          value={data.pipeline.pending}
          subtitle="Awaiting kitchen confirmation"
          icon="⏳"
          accentColor="rose"
          badge={{
            text: data.pipeline.pending > 0 ? "URGENT" : "CLEAR",
            type: data.pipeline.pending > 0 ? "warning" : "positive",
          }}
        />

        <MetricCard
          title="2. Confirmed Queue"
          value={data.pipeline.confirmed}
          subtitle="Queued for stove/oven"
          icon="📝"
          accentColor="amber"
        />

        <MetricCard
          title="3. In Preparation"
          value={data.pipeline.preparing}
          subtitle="Actively cooking"
          icon="🔥"
          accentColor="blue"
        />

        <MetricCard
          title="4. Ready at Pass"
          value={data.pipeline.ready}
          subtitle="Awaiting courier pickup"
          icon="🛎️"
          accentColor="emerald"
        />

        <MetricCard
          title="5. Out for Delivery"
          value={data.pipeline.outForDelivery}
          subtitle="In transit to customer"
          icon="🛵"
          accentColor="purple"
        />
      </div>

      {/* Batch Cooking Demand Board & Today's Shift Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Batch Item Cooking Demand Board */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                🍳 Live Batch Cooking Demand Board
              </h3>
              <p className="text-xs text-slate-400">
                Consolidated dishes ordered across all confirmed and in-prep orders
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {data.batchCookingQueue.reduce((acc, i) => acc + i.quantity, 0)} Items To Cook
            </span>
          </div>

          {data.batchCookingQueue.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm italic">
              Kitchen queue is currently clear! No active dishes pending preparation.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.batchCookingQueue.map((item, idx) => (
                <div
                  key={item.name || idx}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between hover:border-amber-400 transition-colors"
                >
                  <div className="space-y-0.5">
                    <strong className="text-sm font-bold text-slate-900 block">
                      {item.name}
                    </strong>
                    {item.notes.length > 0 && (
                      <span className="text-[11px] text-amber-700 line-clamp-1 block">
                        Note: {item.notes[0]}
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-black text-amber-600 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                    {item.quantity}x
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Shift Performance Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Today&apos;s Shift Output</h3>
            <p className="text-xs text-slate-400 mb-6">
              Total orders handled during today&apos;s service
            </p>

            <div className="space-y-4">
              <ProgressBar
                label="Delivered / Completed"
                value={data.todayStats.completed}
                total={data.todayStats.total}
                color="emerald"
              />
              <ProgressBar
                label="Active in Funnel"
                value={data.pipeline.totalActive}
                total={data.todayStats.total}
                color="amber"
              />
              <ProgressBar
                label="Cancelled / Void"
                value={data.todayStats.cancelled}
                total={data.todayStats.total}
                color="rose"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6 text-center">
            <span className="text-xs font-bold uppercase text-slate-400 block">
              Shift Completion Rate
            </span>
            <strong className="text-3xl font-extrabold text-emerald-600 mt-1 block">
              {data.todayStats.completionRate}%
            </strong>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {data.todayStats.total} Total customer orders created today
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
