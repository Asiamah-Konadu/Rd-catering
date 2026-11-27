"use client";

import React, { useEffect, useRef } from "react";
import { useAdSenseConfig } from "./AdSenseProvider";
import type { AdSlotKey } from "@/lib/ads";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSlotProps {
  slotKey: AdSlotKey;
  className?: string;
  tone?: "light" | "dark";
}

export default function AdSlot({
  slotKey,
  className = "",
  tone = "light",
}: AdSlotProps) {
  const config = useAdSenseConfig();
  const pushedRef = useRef(false);

  const slot = config.slots.find((s) => s.key === slotKey);
  const isActive = Boolean(
    config.enabled &&
      config.publisherId &&
      slot &&
      slot.enabled &&
      slot.slotId &&
      (slot.showOnDesktop || slot.showOnMobile)
  );

  useEffect(() => {
    if (!isActive || pushedRef.current) return;
    pushedRef.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error(`AdSense push failed for ${slotKey}:`, err);
    }
  }, [isActive, slotKey]);

  if (!isActive || !slot) {
    return null;
  }

  const visibilityClass =
    slot.showOnDesktop && slot.showOnMobile
      ? "block"
      : slot.showOnDesktop
        ? "hidden md:block"
        : "block md:hidden";

  const isDark = tone === "dark";

  return (
    <aside
      aria-label="Advertisement"
      className={`rd-ad-wrapper ${visibilityClass} ${
        isDark ? "rd-ad-wrapper-dark" : "rd-ad-wrapper-light"
      } ${className}`}
    >
      <div className="rd-ad-label">Advertisement</div>
      <div id={`ad-slot-${slotKey}`} className="rd-ad-box">
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%" }}
          data-ad-client={config.publisherId}
          data-ad-slot={slot.slotId}
          data-ad-format={slot.format}
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}
