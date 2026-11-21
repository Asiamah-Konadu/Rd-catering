import { prisma } from "@/lib/prisma";

export type SiteSettingsData = {
  businessHoursText: string;
  deliveryFeeText: string;
  deliveryNoteText: string;
  whatsappPhone: string;
  openingTime: string;
  closingTime: string;
  promoEnabled: boolean;
  promoDiscountPct: number;
  promoLabel: string;
  promoMinOrderGHS: number;
};

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  businessHoursText: "Orders open 8am · close 10pm",
  deliveryFeeText: "Standard delivery is GH₵ 20",
  deliveryNoteText: "Registered office orders may qualify for free delivery and group discounts.",
  whatsappPhone: "+233591754764",
  openingTime: "08:00",
  closingTime: "22:00",
  promoEnabled: false,
  promoDiscountPct: 0,
  promoLabel: "Promo",
  promoMinOrderGHS: 0,
};

export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    const settings = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: {},
      create: {
        id: "singleton",
        ...DEFAULT_SITE_SETTINGS,
      },
    });

    return {
      businessHoursText: settings.businessHoursText || DEFAULT_SITE_SETTINGS.businessHoursText,
      deliveryFeeText: settings.deliveryFeeText || DEFAULT_SITE_SETTINGS.deliveryFeeText,
      deliveryNoteText: settings.deliveryNoteText || DEFAULT_SITE_SETTINGS.deliveryNoteText,
      whatsappPhone:
        settings.whatsappPhone && !settings.whatsappPhone.includes("xxxxxxxxx")
          ? settings.whatsappPhone
          : DEFAULT_SITE_SETTINGS.whatsappPhone,
      openingTime: settings.openingTime || DEFAULT_SITE_SETTINGS.openingTime,
      closingTime: settings.closingTime || DEFAULT_SITE_SETTINGS.closingTime,
      promoEnabled: settings.promoEnabled ?? false,
      promoDiscountPct: Number(settings.promoDiscountPct ?? 0),
      promoLabel: settings.promoLabel || DEFAULT_SITE_SETTINGS.promoLabel,
      promoMinOrderGHS: Number(settings.promoMinOrderGHS ?? 0),
    };
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return DEFAULT_SITE_SETTINGS;
  }
}
