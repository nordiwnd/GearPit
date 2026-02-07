// apps/gearpit-web/next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone", // 修正: Dockerビルド用にStandaloneモードを有効化
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: process.env.INTERNAL_API_URL
          ? `${process.env.INTERNAL_API_URL}/:path*`
          : "http://gearpit-app-svc/api/v1/:path*", // Default to K8s Service
      },
    ];
  },
};

export default nextConfig;