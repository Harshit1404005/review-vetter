import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare OpenNext requires specific output configuration
  // Note: Next.js 16 might have specific requirements, but we'll start with standard standalone.
  output: "standalone",
  images: {
    unoptimized: true, // Recommended for Edge hosting unless using Cloudflare Images
  },
};

export default nextConfig;
