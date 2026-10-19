import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "mammoth"],
  experimental: {
    // any experimental flags if needed
  },
};

export default nextConfig;
