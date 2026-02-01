// apps/gearpit-web/lib/api.ts

// 1. 型定義 (GoのStructと同期)
export interface GearItem {
  id: string;
  name: string;
  brand: string;
  weightGram: number;
  isConsumable: boolean;
  category: string;
  // JSONBプロパティ: 柔軟なKeyValue
  properties?: Record<string, any>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// 検索クエリ用型
export interface SearchParams {
  q?: string;           // 名前・ブランド検索
  category?: string;    // カテゴリ
  [key: string]: any;   // p_xxx (プロパティ検索) 用
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 2. APIクライアント
export const api = {
  // 一覧取得
  async getItems(params?: SearchParams): Promise<GearItem[]> {
    const url = new URL(`${API_BASE_URL}/items`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, String(value));
      });
    }

    const res = await fetch(url.toString(), { 
      cache: 'no-store', // 常に最新を取得
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) throw new Error('Failed to fetch items');
    return res.json();
  },

  // 新規作成
  async createItem(item: Partial<GearItem>): Promise<GearItem> {
    const res = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });

    if (!res.ok) throw new Error('Failed to create item');
    return res.json();
  },

  // 削除
  async deleteItem(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete item');
  }
};