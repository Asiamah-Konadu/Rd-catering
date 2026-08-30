import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { CartProvider } from "@/components/cart/CartProvider";

export const metadata: Metadata = {
  title: "Rich-Dons Catering | Fresh food, made easy",
  description: "Order fresh, delicious meals from Rich-Dons Catering.",
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/logo.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><CartProvider><Header/>{children}</CartProvider></body></html>;
}
