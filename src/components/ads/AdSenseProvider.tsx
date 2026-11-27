"use client";

import React, { createContext, useContext } from "react";
import { DEFAULT_ADSENSE_CONFIG, type AdSenseConfigData } from "@/lib/ads";

const AdSenseContext = createContext<AdSenseConfigData>(DEFAULT_ADSENSE_CONFIG);

export function useAdSenseConfig() {
  return useContext(AdSenseContext);
}

export function AdSenseProvider({
  config,
  children,
}: {
  config: AdSenseConfigData;
  children: React.ReactNode;
}) {
  return (
    <AdSenseContext.Provider value={config}>
      {children}
    </AdSenseContext.Provider>
  );
}
