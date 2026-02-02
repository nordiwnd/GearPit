import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // 追加: APIリクエストをバックエンドへプロキシする
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // 環境変数が未設定の場合は、デフォルトでKubernetesのサービス名を使用
        destination: `${process.env.BACKEND_URL || "http://gearpit-app-svc:80"}/:path*`,
      },
    ];
  },
};

export default nextConfig;