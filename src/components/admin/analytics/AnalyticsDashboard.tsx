"use client";

import React, { useState } from "react";
import { AdminAnalyticsView } from "./AdminAnalyticsView";
import { KitchenAnalyticsView } from "./KitchenAnalyticsView";
import { MenuAnalyticsView } from "./MenuAnalyticsView";
import { DeliveryAnalyticsView } from "./DeliveryAnalyticsView";
import type { TimeRange } from "@/lib/analytics";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface AnalyticsDashboardProps {
  role: string;
  initialData: any;
}

export function AnalyticsDashboard({ role, initialData }: AnalyticsDashboardProps) {
  const [data, setData] = useState<any>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalytics = async (timeRange: TimeRange = "7d") => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?timeRange=${timeRange}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setData(json.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch updated analytics", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    fetchAnalytics(range);
  };

  const handleRefresh = () => {
    fetchAnalytics(data?.timeRange || "7d");
  };

  if (!data) return null;

  return (
    <section aria-label="Admin Analytics Section" className="w-full">
      {role === "ADMIN" && (
        <AdminAnalyticsView
          data={data}
          onTimeRangeChange={handleTimeRangeChange}
          isLoading={isLoading}
        />
      )}

      {role === "ORDER_HANDLER" && (
        <KitchenAnalyticsView
          data={data}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
      )}

      {role === "MENU_MANAGER" && (
        <MenuAnalyticsView data={data} isLoading={isLoading} />
      )}

      {role === "DELIVERY_AGENT" && (
        <DeliveryAnalyticsView
          data={data}
          onTimeRangeChange={handleTimeRangeChange}
          isLoading={isLoading}
        />
      )}
    </section>
  );
}
