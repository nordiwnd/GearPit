// apps/gearpit-web/lib/api.ts

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '/api/v1'; // Client-side: Next.js rewrites to backend
  }

  // Server-side: Try INTERNAL_API_URL (for K8s), then NEXT_PUBLIC_API_URL
  if (process.env.INTERNAL_API_URL) return process.env.INTERNAL_API_URL;
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

  // Fallback: Use Service name in Production (K8s), Localhost in Development
  if (process.env.NODE_ENV === 'production') {
    return 'http://gearpit-app-svc/api/v1';
  }
  
  return 'http://localhost:8080/api/v1';
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
  properties?: {
    brand?: string;
    category?: string;
    color?: string;
    [key: string]: any;
  };
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export const gearApi = {
  searchItems: async (query: string): Promise<GearItem[]> => {
    const url = `${getBaseUrl()}/gears?q=${encodeURIComponent(query)}`;
    console.log(`[SSR] Fetching: ${url}`); // Debug Log
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      console.error(`[SSR] Failed to search items: ${res.status} ${res.statusText}`);
      throw new Error('Failed to search gears');
    }
    return res.json();
  },

  listItems: async (filters?: { tag?: string; category?: string; brand?: string }): Promise<GearItem[]> => {
    const params = new URLSearchParams();
    if (filters?.tag) params.append('tag', filters.tag);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.brand) params.append('brand', filters.brand);

    const queryString = params.toString();
    const url = `${getBaseUrl()}/gears${queryString ? `?${queryString}` : ''}`;
    
    console.log(`[SSR] Fetching list: ${url}`); // Debug Log

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
        console.error(`[SSR] Failed to list items: ${res.status} ${res.statusText}`);
        throw new Error('Failed to list gears');
    }
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
// User Profile API
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
// Trip (Packing List) API
// -----------------------------------------------------------------------------

export interface TripItem {
  tripId: string;
  itemId: string;
  quantity: number;
  item: GearItem;
}

export interface Trip {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  tripItems?: TripItem[];
  items?: GearItem[]; 
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

  addItems: async (tripId: string, itemIds: string[]): Promise<void> => {
    const res = await fetch(`${getBaseUrl()}/trips/${tripId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemIds }),
    });
    if (!res.ok) throw new Error('Failed to add items to trip');
  },

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