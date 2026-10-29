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
      { src: "/logo.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
