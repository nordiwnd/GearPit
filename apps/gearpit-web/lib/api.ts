// apps/gearpit-web/lib/api.ts

export interface GearItem {
  id: string;
  name: string;
  description: string;
  weightGram: number;
  tags: string[];
  properties: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGearPayload {
  name: string;
  description: string;
  weightGram: number;
  tags: string[];
  properties: Record<string, any>;
}

// 修正: 実行環境に応じてAPIのBase URLを切り替えるヘルパー関数
const getBaseUrl = () => {
  if (typeof window === "undefined") {
    // 1. Server-side (K8s Pod内でのSSR): Kubernetes内部DNSを使用
    return process.env.INTERNAL_API_URL || "http://gearpit-app-svc:8080/api/v1";
  }
  // 2. Client-side (ブラウザ): 環境変数またはローカルホストを使用
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
};

export const gearApi = {
  // POSTはブラウザ（Client Component）から呼ばれる
  createItem: async (payload: CreateGearPayload): Promise<GearItem> => {
    const res = await fetch(`${getBaseUrl()}/gears`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to create gear: ${res.statusText}`);
    }
    return res.json();
  },

  // GETはNext.jsのサーバー（Server Component）から呼ばれる
  listItems: async (): Promise<GearItem[]> => {
    const res = await fetch(`${getBaseUrl()}/gears`, { 
      cache: 'no-store' // 常に最新のデータを取得
    });
    if (!res.ok) throw new Error('Failed to fetch gears');
    return res.json();
  }
};