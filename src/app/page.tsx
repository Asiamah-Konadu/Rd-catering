import WaitlistSection from "@/components/WaitlistSection";

export const metadata = {
  title: "Rich-Dons Catering — Fresh Ghanaian Food Delivered in Accra | Launching Soon",
  description:
    "Rich-Dons Catering is launching in Accra, Ghana on November 6, 2026. Join our VIP early list now to claim your unique Free Delivery promo code on Jollof, Banku, Waffles, Waakye, and more.",
};

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      <WaitlistSection />
    </main>
  );
}
