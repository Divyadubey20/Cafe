import type { NextConfig } from "next";

// Dynamically resolve backend destination (local or production api server)
const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
  images: {
    domains: ["source.unsplash.com", "images.unsplash.com"],
  },
};

export default nextConfig;
