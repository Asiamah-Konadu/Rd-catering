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
            fontSize: "15px",
            fontWeight: "700",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "24px",
          }}
        >
          🇬🇭 ACCRA PRE-LAUNCH • VIP EARLY ACCESS
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
            fontSize: "32px",
            fontWeight: "600",
            color: "#f59e0b",
            textAlign: "center",
            marginTop: "12px",
            display: "flex",
          }}
        >
          Fresh Ghanaian Food, Coming to Your Doorstep.
        </div>

        {/* Sub-bullet items */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginTop: "32px",
            color: "#e2e8f0",
            fontSize: "18px",
            fontWeight: "500",
          }}
        >
          <span>🍚 Smoky Jollof</span>
          <span>•</span>
          <span>🧇 Fresh Waffles</span>
          <span>•</span>
          <span>🐟 Banku & Tilapia</span>
          <span>•</span>
          <span>🥘 Special Waakye</span>
        </div>

        {/* Perk highlight pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "36px",
            padding: "12px 28px",
            background: "linear-gradient(90deg, #d97706, #b45309)",
            borderRadius: "16px",
            color: "#ffffff",
            fontSize: "18px",
            fontWeight: "700",
            boxShadow: "0 10px 25px -5px rgba(217, 119, 6, 0.4)",
          }}
        >
          🎁 Claim Free Delivery on Your 1st Order (Launch Code)
        </div>
      </div>
    ),
    size
  );
}
