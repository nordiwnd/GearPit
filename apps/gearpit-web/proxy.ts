import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // /api/ から始まるリクエストを検知
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // 実行時に環境変数を読み込む (なければ K8s Service)
    // NOTE: deployment.yamlで INTERNAL_API_URL が設定されている
    const backendUrl = process.env.INTERNAL_API_URL || 'http://gearpit-app-svc/api/v1';

    // バックエンドのURLを構築
    // 例: http://gearpit-app-svc...:80/api/v1/gears
    const targetUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, backendUrl);

    // リライト（プロキシ）実行
    return NextResponse.rewrite(targetUrl);
  }
}

export const config = {
  // /api/ 以下すべてのパスにマッチ
  matcher: '/api/:path*',
};