"use client";

import React from "react";
import Link from "next/link";
import { MetricCard } from "./MetricCard";
import { ProgressBar } from "./ChartWidgets";

interface MenuAnalyticsProps {
  data: {
    catalogHealth: {
      total: number;
      active: number;
      unavailable: number;
      availabilityRate: number;
      weeklySpecialCount: number;
    };
    categoryStats: Array<{
      name: string;
      totalItems: number;
      activeItems: number;
      inactiveItems: number;
    }>;
    topDishes: Array<{
      name: string;
      quantity: number;
      revenue: number;
    }>;
    lowDemandDishes: Array<{
      name: string;
      quantity: number;
      revenue: number;
    }>;
    topExtras: Array<{
      name: string;
      count: number;
    }>;
  };
  isLoading?: boolean;
}

export function MenuAnalyticsView({ data, isLoading }: MenuAnalyticsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <span>🍲 Menu Catalog & Culinary Intelligence</span>
            {isLoading && (
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            )}
          </h2>
          <p className="text-xs text-slate-500">
            Dish velocity, catalog availability health, and add-on attach rates.
          </p>
        </div>

        <Link
          href="/admin/menu"
          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1"
        >
          <span>Manage Menu Catalog</span>
          <span>→</span>
        </Link>
      </div>

      {/* Catalog Health KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Catalog Availability"
          value={`${data.catalogHealth.availabilityRate}%`}
          subtitle={`${data.catalogHealth.active} of ${data.catalogHealth.total} active`}
          icon="✅"
          accentColor="emerald"
          badge={{
            text: "IN STOCK",
            type: data.catalogHealth.availabilityRate >= 80 ? "positive" : "warning",
          }}
        />

        <MetricCard
          title="Out of Stock"
          value={data.catalogHealth.unavailable}
          subtitle="Items currently unavailable"
          icon="🚫"
          accentColor="rose"
          badge={{
            text: data.catalogHealth.unavailable > 0 ? "ACTION NEEDED" : "ALL IN STOCK",
            type: data.catalogHealth.unavailable > 0 ? "warning" : "positive",
          }}
        />

        <MetricCard
          title="Total Menu Items"
          value={data.catalogHealth.total}
          subtitle={`${data.categoryStats.length} Food Categories`}
          icon="📖"
          accentColor="blue"
        />

        <MetricCard
          title="Weekly Menu Specials"
          value={data.catalogHealth.weeklySpecialCount}
          subtitle="Special featured items"
          icon="⭐"
          accentColor="purple"
        />
      </div>

      {/* Category Distribution & Popular Extras */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Coverage */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Category Coverage & Item Availability
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Proportion of active menu offerings grouped by category
          </p>

          <div className="space-y-4">
            {data.categoryStats.map((cat) => (
              <ProgressBar
                key={cat.name}
                label={cat.name}
                value={cat.activeItems}
                total={cat.totalItems}
                valueLabel={`${cat.activeItems} / ${cat.totalItems} active`}
                color={cat.inactiveItems > 0 ? "amber" : "blue"}
              />
            ))}
          </div>
        </div>

        {/* Most Ordered Extras / Add-ons */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Top Add-on Extras</h3>
            <p className="text-xs text-slate-400 mb-4">
              Frequently attached extras & sides
            </p>

            {data.topExtras.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm italic">
                No add-on extras recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {data.topExtras.map((extra, idx) => (
                  <div
                    key={extra.name || idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <span className="text-xs font-bold text-slate-700">
                      {idx + 1}. {extra.name}
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {extra.count} ordered
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Velocity vs Low Demand Dishes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Sellers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-emerald-700 flex items-center gap-2 mb-1">
            <span>🔥 Best-Selling Dishes</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Highest customer demand</p>

          <div className="space-y-2.5">
            {data.topDishes.map((dish, index) => (
              <div
                key={dish.name}
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 w-6 h-6 rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {dish.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 block font-mono">
                    {dish.quantity} sold
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    GH₵ {dish.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Demand Dishes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-amber-800 flex items-center gap-2 mb-1">
            <span>🧊 Low Velocity Items (Review Candidates)</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Candidates for promo or recipe refresh</p>

          {data.lowDemandDishes.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm italic">
              All dishes maintain healthy demand volume.
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.lowDemandDishes.map((dish) => (
                <div
                  key={dish.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {dish.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                    {dish.quantity} sold
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
