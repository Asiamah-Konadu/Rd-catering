import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Rich-Dons Catering",
    short_name: "Rich-Dons",
    description: "Order fresh Ghanaian food and catering in Accra.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf8",
    theme_color: "#f74326",
    icons: [
      { src: "/favicon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/favicon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
