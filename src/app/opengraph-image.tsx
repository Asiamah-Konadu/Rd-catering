import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Rich-Dons Catering - Fresh Ghanaian Food, Delivered in Accra";
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
          background: "linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1a0a00 100%)",
          fontFamily: "Georgia, serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative blobs */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-120px",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            background: "rgba(210, 120, 30, 0.15)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "rgba(210, 120, 30, 0.1)",
            display: "flex",
          }}
        />

        {/* Brand name */}
        <div
          style={{
            fontSize: "18px",
            fontWeight: "700",
            letterSpacing: "6px",
            textTransform: "uppercase",
            color: "#d2781e",
            marginBottom: "24px",
            display: "flex",
          }}
        >
          RICH-DONS CATERING
        </div>

        {/* Amber divider */}
        <div
          style={{
            width: "80px",
            height: "3px",
            background: "linear-gradient(90deg, transparent, #d2781e, transparent)",
            borderRadius: "2px",
            marginBottom: "32px",
            display: "flex",
          }}
        />

        {/* Main headline */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: "800",
            color: "#fff8f0",
            textAlign: "center",
            lineHeight: 1.1,
            letterSpacing: "-1px",
            maxWidth: "900px",
            display: "flex",
          }}
        >
          Fresh Ghanaian Food
        </div>

        {/* Sub-headline */}
        <div
          style={{
            fontSize: "40px",
            fontWeight: "400",
            fontStyle: "italic",
            color: "#d2781e",
            textAlign: "center",
            marginTop: "12px",
            display: "flex",
          }}
        >
          Delivered in Accra
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: "40px",
            fontSize: "22px",
            color: "#c4a882",
            textAlign: "center",
            letterSpacing: "1px",
            display: "flex",
          }}
        >
          Office meals · Family trays · Same-day favourites
        </div>
      </div>
    ),
    size
  );
}
