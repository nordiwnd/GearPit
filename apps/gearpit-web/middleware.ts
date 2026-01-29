import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // /api/ から始まるリクエストを検知
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // 実行時に環境変数を読み込む (なければ localhost)
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    
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