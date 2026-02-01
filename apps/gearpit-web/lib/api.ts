// apps/gearpit-web/lib/api.ts

// --- Types ---

// GearItem (既存)
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

// Loadout (追加)
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

// Search Params
export interface SearchParams {
  q?: string;
  category?: string;
  [key: string]: any;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// --- API Client ---

export const api = {
  // --- Gear Items Methods ---
  
  async getItems(params?: SearchParams): Promise<GearItem[]> {
    const url = new URL(`${API_BASE_URL}/items`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, String(value));
      });
    }

    const res = await fetch(url.toString(), { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) throw new Error('Failed to fetch items');
    return res.json();
  },

  async createItem(item: Partial<GearItem>): Promise<GearItem> {
    const res = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });

    if (!res.ok) throw new Error('Failed to create item');
    return res.json();
  },

  async updateItem(id: string, item: Partial<GearItem>): Promise<GearItem> {
    const res = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });

    if (!res.ok) throw new Error('Failed to update item');
    return res.json();
  },

  async deleteItem(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete item');
  },

  // --- Loadout Methods (New) ---

  async getLoadouts(): Promise<Loadout[]> {
    const res = await fetch(`${API_BASE_URL}/loadouts`, { 
      cache: 'no-store', // 常に最新を取得
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to fetch loadouts');
    return res.json();
  },

  async createLoadout(data: Partial<Loadout>): Promise<Loadout> {
    const res = await fetch(`${API_BASE_URL}/loadouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create loadout');
    return res.json();
  },

  async updateLoadout(id: string, data: Partial<Loadout>): Promise<Loadout> {
    const res = await fetch(`${API_BASE_URL}/loadouts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update loadout');
    return res.json();
  },

  async deleteLoadout(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/loadouts/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete loadout');
  }
};