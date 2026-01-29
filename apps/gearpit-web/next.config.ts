import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // 以下を追加: リクエストをバックエンドへ転送する設定
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/:path*`,
      },
    ]
  },
};

export default nextConfig;