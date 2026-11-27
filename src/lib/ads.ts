import { prisma } from "@/lib/prisma";

export type AdSlotKey =
  | "home_mid_banner"
  | "home_pre_footer"
  | "menu_sidebar_desktop"
  | "menu_in_feed"
  | "dish_detail_bottom"
  | "corporate_directory_mid"
  | "events_pre_faq"
  | "order_tracker_bottom";

export type AdFormat = "auto" | "horizontal" | "rectangle" | "fluid";

export type AdSlotConfig = {
  key: AdSlotKey;
  enabled: boolean;
  slotId: string;
  showOnDesktop: boolean;
  showOnMobile: boolean;
  format: AdFormat;
};

export type AdSlotDefinition = {
  key: AdSlotKey;
  label: string;
  page: string;
  locationDescription: string;
  recommendedSize: string;
  uxNote: string;
  supportsDesktop: boolean;
  supportsMobile: boolean;
  defaultFormat: AdFormat;
};

export const AD_SLOT_DEFINITIONS: AdSlotDefinition[] = [
  {
    key: "home_mid_banner",
    label: "Homepage Mid-Page Banner",
    page: "Homepage (/)",
    locationDescription: "Between Customer Reviews and This Week's Dishes carousel.",
    recommendedSize: "Desktop: 728×90 / Responsive · Mobile: 320×100 / Responsive",
    uxNote: "Below the fold; never pushes the Hero CTA or Mobile Bento Grid off-screen.",
    supportsDesktop: true,
    supportsMobile: true,
    defaultFormat: "horizontal",
  },
  {
    key: "home_pre_footer",
    label: "Homepage Pre-Footer Banner",
    page: "Homepage (/)",
    locationDescription: "Below How to Order / Journey Rope, right above the footer.",
    recommendedSize: "Desktop: 728×90 or 970×90 · Mobile: 320×100 / 300×250",
    uxNote: "Natural reading pause at the end of the homepage.",
    supportsDesktop: true,
    supportsMobile: true,
    defaultFormat: "auto",
  },
  {
    key: "menu_sidebar_desktop",
    label: "Menu Left Sidebar (Desktop Only)",
    page: "Weekly Menu (/menu)",
    locationDescription: "Inside the left sticky sidebar below the Categories list.",
    recommendedSize: "Desktop: 300×250 Medium Rectangle (hidden on mobile)",
    uxNote: "Keeps the dish grid and right-hand Live Cart 100% free of ad clutter.",
    supportsDesktop: true,
    supportsMobile: false,
    defaultFormat: "rectangle",
  },
  {
    key: "menu_in_feed",
    label: "Menu In-Feed Category Break",
    page: "Weekly Menu (/menu)",
    locationDescription: "Placed between menu category sections (after the 2nd category).",
    recommendedSize: "Desktop: 728×90 / Responsive · Mobile: 320×100 / Responsive",
    uxNote: "Separated from dish '+ Add' buttons to prevent accidental clicks.",
    supportsDesktop: true,
    supportsMobile: true,
    defaultFormat: "horizontal",
  },
  {
    key: "dish_detail_bottom",
    label: "Dish Detail Bottom Banner",
    page: "Dish Detail (/menu/[slug])",
    locationDescription: "Below the dish description and Add to Cart section.",
    recommendedSize: "Desktop: 728×90 / Responsive · Mobile: 320×100 / Responsive",
    uxNote: "Appears below the primary ordering action with generous spacing.",
    supportsDesktop: true,
    supportsMobile: true,
    defaultFormat: "horizontal",
  },
  {
    key: "corporate_directory_mid",
    label: "Corporate Directory Mid Banner",
    page: "Corporate Directory (/corporate)",
    locationDescription: "Between the Partner Company Directory and the Corporate FAQ.",
    recommendedSize: "Desktop: 728×90 / Responsive · Mobile: 320×100 / Responsive",
    uxNote: "Informational B2B page only; never shown inside active employee order portals.",
    supportsDesktop: true,
    supportsMobile: true,
    defaultFormat: "horizontal",
  },
  {
    key: "events_pre_faq",
    label: "Events Page Pre-FAQ Banner",
    page: "Event Catering (/events)",
    locationDescription: "Below the Event Inquiry form and above the FAQ section.",
    recommendedSize: "Desktop: 728×90 / Responsive · Mobile: 320×100 / Responsive",
    uxNote: "Keeps the hero and multi-step booking form completely distraction-free.",
    supportsDesktop: true,
    supportsMobile: true,
    defaultFormat: "horizontal",
  },
  {
    key: "order_tracker_bottom",
    label: "Order Tracker Bottom Banner",
    page: "Order Tracker (/order/[orderNumber])",
    locationDescription: "Below the live order status, receipt items, and review box.",
    recommendedSize: "Desktop: 728×90 / 300×250 · Mobile: 320×100 / 300×250",
    uxNote: "Monetizes repeat status checks without interfering with tracking or reviews.",
    supportsDesktop: true,
    supportsMobile: true,
    defaultFormat: "auto",
  },
];

export type AdSenseConfigData = {
  enabled: boolean;
  publisherId: string;
  slots: AdSlotConfig[];
};

export const DEFAULT_AD_SLOTS: AdSlotConfig[] = AD_SLOT_DEFINITIONS.map((def) => ({
  key: def.key,
  enabled: false,
  slotId: "",
  showOnDesktop: def.supportsDesktop,
  showOnMobile: def.supportsMobile,
  format: def.defaultFormat,
}));

export const DEFAULT_PUBLISHER_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-5639554081238364";

export const DEFAULT_ADSENSE_CONFIG: AdSenseConfigData = {
  enabled: false,
  publisherId: DEFAULT_PUBLISHER_ID,
  slots: DEFAULT_AD_SLOTS,
};

export function mergeAdSlots(rawJson: string | null | undefined): AdSlotConfig[] {
  let parsed: Partial<AdSlotConfig>[] = [];
  if (rawJson) {
    try {
      const data = JSON.parse(rawJson);
      if (Array.isArray(data)) parsed = data;
    } catch {
      parsed = [];
    }
  }

  const byKey = new Map(parsed.map((item) => [item.key, item]));

  return AD_SLOT_DEFINITIONS.map((def) => {
    const saved = byKey.get(def.key);
    return {
      key: def.key,
      enabled: Boolean(saved?.enabled ?? false),
      slotId: typeof saved?.slotId === "string" ? saved.slotId.trim() : "",
      showOnDesktop: def.supportsDesktop
        ? Boolean(saved?.showOnDesktop ?? true)
        : false,
      showOnMobile: def.supportsMobile
        ? Boolean(saved?.showOnMobile ?? true)
        : false,
      format:
        saved?.format === "auto" ||
        saved?.format === "horizontal" ||
        saved?.format === "rectangle" ||
        saved?.format === "fluid"
          ? saved.format
          : def.defaultFormat,
    };
  });
}

export async function getAdSenseConfig(): Promise<AdSenseConfigData> {
  try {
    const row = await prisma.adSenseConfig.findUnique({
      where: { id: "singleton" },
    });

    if (!row) {
      return DEFAULT_ADSENSE_CONFIG;
    }

    return {
      enabled: Boolean(row.enabled),
      publisherId:
        row.publisherId?.trim() ||
        DEFAULT_PUBLISHER_ID,
      slots: mergeAdSlots(row.slotsJson),
    };
  } catch (error) {
    // Graceful fallback if D1 migration hasn't been applied yet
    console.error("Failed to fetch AdSense config:", error);
    return DEFAULT_ADSENSE_CONFIG;
  }
}
