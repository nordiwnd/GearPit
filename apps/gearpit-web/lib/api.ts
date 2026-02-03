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

export interface GearPayload {
  name: string;
  description: string;
  weightGram: number;
  tags: string[];
  properties: Record<string, any>;
}

export interface GearFilter {
  tag?: string;
  category?: string;
  brand?: string;
}

const getBaseUrl = () => {
  if (typeof window === "undefined") {
    return process.env.INTERNAL_API_URL || "http://gearpit-app-svc/api/v1";
  }
  return "/api/v1";
};

export const gearApi = {
  createItem: async (payload: GearPayload): Promise<GearItem> => {
    const res = await fetch(`${getBaseUrl()}/gears`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to create gear: ${res.statusText}`);
    return res.json();
  },

  // 修正: 検索フィルターに対応
  listItems: async (filter?: GearFilter): Promise<GearItem[]> => {
    const params = new URLSearchParams();
    if (filter?.tag) params.append('tag', filter.tag);
    if (filter?.category) params.append('category', filter.category);
    if (filter?.brand) params.append('brand', filter.brand);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${getBaseUrl()}/gears${queryString}`, { 
      cache: 'no-store' 
    });
    if (!res.ok) throw new Error('Failed to fetch gears');
    return res.json();
  },

  // 追加: 更新API
  updateItem: async (id: string, payload: GearPayload): Promise<GearItem> => {
    const res = await fetch(`${getBaseUrl()}/gears/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to update gear: ${res.statusText}`);
    return res.json();
  },

  // 追加: 削除API (Soft Delete)
  deleteItem: async (id: string): Promise<void> => {
    const res = await fetch(`${getBaseUrl()}/gears/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to delete gear: ${res.statusText}`);
  }
};