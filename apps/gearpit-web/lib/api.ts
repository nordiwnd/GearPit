// apps/gearpit-web/lib/api.ts

// --- Types ---

// GearItem
export interface GearItem {
  id: string;
  name: string;
  brand: string;
  weightGram: number;
  isConsumable: boolean;
  category: string;
  properties?: Record<string, any>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Loadout
export interface LoadoutItem {
  itemId: string;
  quantity: number;
  isChecked: boolean;
}

export interface Loadout {
  id: string;
  name: string;
  items: LoadoutItem[];
  totalWeightGram: number;
  createdAt: string;
  updatedAt: string;
}

// Kit Type
export interface Kit {
  id: string;
  name: string;
  itemIds: string[]; // シンプルなID配列
  createdAt: string;
  updatedAt: string;
}

// Search Params
export interface SearchParams {
  q?: string;
  category?: string;
  [key: string]: any;
}

// --- URL Helper ---

// バックエンドへのプレフィックス (next.config.tsのrewrites設定と合わせる)
const API_PREFIX = '/api';

/**
 * 環境（ブラウザ or サーバー）に応じて適切なURLを生成するヘルパー関数
 */
const createUrl = (path: string, params?: SearchParams): string => {
  // ブラウザ実行時は window.location.origin (現在のオリジン) を使用
  // SSR実行時は localhost:3000 (または環境変数で指定されたホスト) を使用
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : (process.env.INTERNAL_WEB_URL || 'http://localhost:3000');

  const url = new URL(`${baseUrl}${API_PREFIX}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
};

// --- API Client ---

export const api = {
  // --- Gear Items Methods ---
  
  async getItems(params?: SearchParams): Promise<GearItem[]> {
    const url = createUrl('/items', params);

    const res = await fetch(url, { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) throw new Error('Failed to fetch items');
    return res.json();
  },

  async createItem(item: Partial<GearItem>): Promise<GearItem> {
    const url = createUrl('/items');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });

    if (!res.ok) throw new Error('Failed to create item');
    return res.json();
  },

  async updateItem(id: string, item: Partial<GearItem>): Promise<GearItem> {
    const url = createUrl(`/items/${id}`);
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });

    if (!res.ok) throw new Error('Failed to update item');
    return res.json();
  },

  async deleteItem(id: string): Promise<void> {
    const url = createUrl(`/items/${id}`);
    const res = await fetch(url, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete item');
  },

  // --- Loadout Methods ---

  async getLoadouts(): Promise<Loadout[]> {
    const url = createUrl('/loadouts');
    const res = await fetch(url, { 
      cache: 'no-store', 
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to fetch loadouts');
    return res.json();
  },

  async getLoadout(id: string): Promise<Loadout> {
    const url = createUrl(`/loadouts/${id}`);
    const res = await fetch(url, { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to fetch loadout');
    return res.json();
  },

  async createLoadout(data: Partial<Loadout>): Promise<Loadout> {
    const url = createUrl('/loadouts');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create loadout');
    return res.json();
  },

  async updateLoadout(id: string, data: Partial<Loadout>): Promise<Loadout> {
    const url = createUrl(`/loadouts/${id}`);
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update loadout');
    return res.json();
  },

  async deleteLoadout(id: string): Promise<void> {
    const url = createUrl(`/loadouts/${id}`);
    const res = await fetch(url, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete loadout');
  },
  
  // --- Kit Methods ---

  async getKits(): Promise<Kit[]> {
    const url = createUrl('/kits');
    const res = await fetch(url, { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to fetch kits');
    return res.json();
  },

  async getKit(id: string): Promise<Kit> {
    const url = createUrl(`/kits/${id}`);
    const res = await fetch(url, { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to fetch kit');
    return res.json();
  },

  async createKit(data: Partial<Kit>): Promise<Kit> {
    const url = createUrl('/kits');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create kit');
    return res.json();
  },

  async updateKit(id: string, data: Partial<Kit>): Promise<Kit> {
    const url = createUrl(`/kits/${id}`);
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update kit');
    return res.json();
  },

  async deleteKit(id: string): Promise<void> {
    const url = createUrl(`/kits/${id}`);
    const res = await fetch(url, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete kit');
  }
};