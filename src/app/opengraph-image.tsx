import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Rich-Dons Catering — Fresh Ghanaian Food Delivered in Accra";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #180d04 0%, #2e1605 50%, #150a02 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
          padding: "40px",
        }}
      >
        {/* Glow backdrop circles */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "450px",
            height: "450px",
            borderRadius: "50%",
            background: "rgba(245, 158, 11, 0.15)",
            filter: "blur(60px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "450px",
            height: "450px",
            borderRadius: "50%",
            background: "rgba(234, 88, 12, 0.15)",
            filter: "blur(60px)",
            display: "flex",
          }}
        />

        {/* Top VIP Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 20px",
            background: "rgba(245, 158, 11, 0.15)",
            border: "1px solid rgba(245, 158, 11, 0.35)",
            borderRadius: "9999px",
            color: "#fbbf24",
            fontSize: "14px",
            fontWeight: "800",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "20px",
          }}
        >
          🇬🇭 FRESH GHANAIAN CATERING • DELIVERED IN ACCRA
        </div>

        {/* Brand Name */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.1,
            letterSpacing: "-1px",
            display: "flex",
          }}
        >
          RICH-DONS CATERING
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "30px",
            fontWeight: "600",
            color: "#f59e0b",
            textAlign: "center",
            marginTop: "12px",
            display: "flex",
          }}
        >
          Authentic Ghanaian Food, Cooked Fresh to Order.
        </div>

        {/* Sub-bullet items */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginTop: "28px",
            color: "#e2e8f0",
            fontSize: "17px",
            fontWeight: "600",
          }}
        >
          <span>🍚 Smoky Jollof</span>
          <span>•</span>
          <span>🥘 Special Waakye</span>
          <span>•</span>
          <span>🐟 Banku & Tilapia</span>
          <span>•</span>
          <span>💼 Office Lunch Portals</span>
        </div>

        {/* Perk highlight pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "32px",
            padding: "12px 28px",
            background: "linear-gradient(90deg, #d97706, #b45309)",
            borderRadius: "16px",
            color: "#ffffff",
            fontSize: "17px",
            fontWeight: "700",
            boxShadow: "0 10px 25px -5px rgba(217, 119, 6, 0.4)",
          }}
        >
          ⚡ Doorstep Delivery & Instant WhatsApp Ordering Across Accra
        </div>
      </div>
    ),
    size
  );
}
