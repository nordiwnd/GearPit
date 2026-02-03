import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 修正: ブラウザからのAPIリクエストをGoバックエンドへ転送(プロキシ)する設定
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: process.env.INTERNAL_API_URL 
          ? `${process.env.INTERNAL_API_URL}/:path*`
          : "http://gearpit-app-svc/api/v1/:path*", // K8s Serviceへの内部ルーティング
      },
    ];
  },
};

export default nextConfig;