import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  serverExternalPackages: ["@prisma/client", ".prisma/client"]
};

export default nextConfig;
