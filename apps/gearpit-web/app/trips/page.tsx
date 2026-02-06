// apps/gearpit-web/lib/api.ts

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '/api/v1'; // Next.js rewrites to backend
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
};

// -----------------------------------------------------------------------------
// Gear (Inventory) API
// -----------------------------------------------------------------------------
export interface GearItem {
  id: string;
  name: string;
  description: string;
  manufacturer: string;
  weightGram: number;
  unit: string;
  // Backend changes: Tags removed, replaced by flexible properties
  properties?: {
    brand?: string;
    category?: string;
    color?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export const gearApi = {
  searchItems: async (query: string): Promise<GearItem[]> => {
    const res = await fetch(`${getBaseUrl()}/gears?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to search gears');
    return res.json();
  },

  listItems: async (): Promise<GearItem[]> => {
    // Reusing search for list all (empty query) if backend supports it, 
    // or use a dedicated list endpoint if available. 
    // Assuming /gears returns list by default.
    const res = await fetch(`${getBaseUrl()}/gears`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to list gears');
    return res.json();
  },

  createItem: async (payload: any): Promise<GearItem> => {
    const res = await fetch(`${getBaseUrl()}/gears`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create gear');
    return res.json();
  },

  updateItem: async (id: string, payload: any): Promise<GearItem> => {
    const res = await fetch(`${getBaseUrl()}/gears/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update gear');
    return res.json();
  },

  deleteItem: async (id: string): Promise<void> => {
    const res = await fetch(`${getBaseUrl()}/gears/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete gear');
  },
};

// -----------------------------------------------------------------------------
// Kits API
// -----------------------------------------------------------------------------
export interface Kit {
  id: string;
  name: string;
  description: string;
  items?: GearItem[];
  createdAt: string;
  updatedAt: string;
}

export const kitApi = {
  list: async (): Promise<Kit[]> => {
    const res = await fetch(`${getBaseUrl()}/kits`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch kits');
    return res.json();
  },
  get: async (id: string): Promise<Kit> => {
    const res = await fetch(`${getBaseUrl()}/kits/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch kit');
    return res.json();
  },
  create: async (payload: any): Promise<Kit> => {
    const res = await fetch(`${getBaseUrl()}/kits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create kit');
    return res.json();
  },
};

// -----------------------------------------------------------------------------
// Loadouts API
// -----------------------------------------------------------------------------
export interface Loadout {
  id: string;
  name: string;
  activityType: string;
  items?: GearItem[];
  kits?: Kit[];
  totalWeightGram: number;
  createdAt: string;
  updatedAt: string;
}

export const loadoutApi = {
  list: async (): Promise<Loadout[]> => {
    const res = await fetch(`${getBaseUrl()}/loadouts`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch loadouts');
    return res.json();
  },
  get: async (id: string): Promise<Loadout> => {
    const res = await fetch(`${getBaseUrl()}/loadouts/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch loadout');
    return res.json();
  },
  create: async (payload: any): Promise<Loadout> => {
    const res = await fetch(`${getBaseUrl()}/loadouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create loadout');
    return res.json();
  },
  update: async (id: string, payload: any): Promise<Loadout> => {
    const res = await fetch(`${getBaseUrl()}/loadouts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update loadout');
    return res.json();
  },
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${getBaseUrl()}/loadouts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete loadout');
  },
};

// -----------------------------------------------------------------------------
// Maintenance API
// -----------------------------------------------------------------------------
export interface MaintenanceLog {
  id: string;
  itemId: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  createdAt: string;
}

export const maintenanceApi = {
  addLog: async (payload: any): Promise<MaintenanceLog> => {
    const res = await fetch(`${getBaseUrl()}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to add maintenance log');
    return res.json();
  },
  getItemLogs: async (itemId: string): Promise<MaintenanceLog[]> => {
    const res = await fetch(`${getBaseUrl()}/maintenance/item/${itemId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch logs');
    return res.json();
  },
  updateLog: async (id: string, payload: any): Promise<MaintenanceLog> => {
    const res = await fetch(`${getBaseUrl()}/maintenance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update log');
    return res.json();
  },
  deleteLog: async (id: string): Promise<void> => {
    const res = await fetch(`${getBaseUrl()}/maintenance/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete log');
  },
};

// -----------------------------------------------------------------------------
// Dashboard API
// -----------------------------------------------------------------------------
export interface DashboardStats {
  totalItems: number;
  totalWeight: number;
  totalLoadouts: number;
  totalCost: number;
  categoryStats: {
    category: string;
    count: number;
    totalWeight: number;
  }[];
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await fetch(`${getBaseUrl()}/dashboard/stats`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },
};

// -----------------------------------------------------------------------------
// User Profile API (New)
// -----------------------------------------------------------------------------
export interface UserProfile {
  id: string;
  name: string;
  heightCm: number;
  weightKg: number;
  age: number;
  gender: string;
  createdAt: string;
  updatedAt: string;
}

export const profileApi = {
  list: async (): Promise<UserProfile[]> => {
    const res = await fetch(`${getBaseUrl()}/profiles`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch profiles');
    return res.json();
  },
  create: async (payload: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await fetch(`${getBaseUrl()}/profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create profile');
    return res.json();
  },
  update: async (id: string, payload: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await fetch(`${getBaseUrl()}/profiles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${getBaseUrl()}/profiles/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete profile');
  },
};

// -----------------------------------------------------------------------------
// Trip (Packing List) API (Updated)
// -----------------------------------------------------------------------------

// 中間テーブル用の型
export interface TripItem {
  tripId: string;
  itemId: string;
  quantity: number;
  item: GearItem; // ネストされたアイテム詳細
}

export interface Trip {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  
  // Changed: items -> tripItems (with quantity)
  tripItems?: TripItem[];
  // Legacy support field if needed, but prefer tripItems
  items?: GearItem[]; 
  
  // User Profile
  userProfileId?: string;
  userProfile?: UserProfile;

  createdAt: string;
  updatedAt: string;
}

export interface CreateTripPayload {
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  userProfileId?: string;
}

export const tripApi = {
  list: async (): Promise<Trip[]> => {
    const res = await fetch(`${getBaseUrl()}/trips`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch trips');
    return res.json();
  },

  get: async (id: string): Promise<Trip> => {
    const res = await fetch(`${getBaseUrl()}/trips/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch trip');
    return res.json();
  },

  create: async (payload: CreateTripPayload): Promise<Trip> => {
    const res = await fetch(`${getBaseUrl()}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create trip');
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${getBaseUrl()}/trips/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete trip');
  },

  // 一括追加 (既存互換)
  addItems: async (tripId: string, itemIds: string[]): Promise<void> => {
    const res = await fetch(`${getBaseUrl()}/trips/${tripId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemIds }),
    });
    if (!res.ok) throw new Error('Failed to add items to trip');
  },

  // 数量更新 (新規)
  updateItemQuantity: async (tripId: string, itemId: string, quantity: number): Promise<void> => {
    const res = await fetch(`${getBaseUrl()}/trips/${tripId}/items`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, quantity }),
    });
    if (!res.ok) throw new Error('Failed to update item quantity');
  },

  removeItems: async (tripId: string, itemIds: string[]): Promise<void> => {
    const res = await fetch(`${getBaseUrl()}/trips/${tripId}/items`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemIds }),
    });
    if (!res.ok) throw new Error('Failed to remove items from trip');
  }
};