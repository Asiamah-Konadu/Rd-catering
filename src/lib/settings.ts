import { prisma } from "@/lib/prisma";

export type SiteSettingsData = {
  businessHoursText: string;
  deliveryFeeText: string;
  deliveryNoteText: string;
  whatsappPhone: string;
};

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  businessHoursText: "Orders open 9am · close 10pm",
  deliveryFeeText: "Standard delivery is GH₵ 20",
  deliveryNoteText: "Registered office orders may qualify for free delivery and group discounts.",
  whatsappPhone: "+233248179348",
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
    };
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return DEFAULT_SITE_SETTINGS;
  }
}
