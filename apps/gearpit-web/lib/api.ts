// apps/gearpit-web/lib/api.ts

// -----------------------------------------------------------------------------
// Base URL Logic (SSR vs Client)
// -----------------------------------------------------------------------------
const getBaseUrl = () => {
  if (typeof window === "undefined") {
    // Server-side (SSR): K8s Internal DNS
    return process.env.INTERNAL_API_URL || "http://gearpit-app-svc/api/v1";
  }
  // Client-side (Browser): Next.js Rewrites
  return "/api/v1";
};


// -----------------------------------------------------------------------------
// Gear API
// -----------------------------------------------------------------------------
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

  updateItem: async (id: string, payload: GearPayload): Promise<GearItem> => {
    const res = await fetch(`${getBaseUrl()}/gears/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to update gear: ${res.statusText}`);
    return res.json();
  },

  deleteItem: async (id: string): Promise<void> => {
    const res = await fetch(`${getBaseUrl()}/gears/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to delete gear: ${res.statusText}`);
  }
};


// -----------------------------------------------------------------------------
// Loadout & Kit API
// -----------------------------------------------------------------------------
export interface Kit {
  id: string;
  name: string;
  description: string;
  items?: GearItem[];
}

export interface Loadout {
  id: string;
  name: string;
  activityType: string;
  totalWeightGram: number; 
  kits?: Kit[];
  items?: GearItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoadoutPayload {
  name: string;
  activityType: string;
  kitIds: string[];
  itemIds: string[];
}

export const loadoutApi = {
  create: async (payload: CreateLoadoutPayload): Promise<Loadout> => {
    const res = await fetch(`${getBaseUrl()}/loadouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to create loadout: ${res.statusText}`);
    return res.json();
  },

  list: async (): Promise<Loadout[]> => {
    const res = await fetch(`${getBaseUrl()}/loadouts`, { 
      cache: 'no-store' 
    });
    if (!res.ok) throw new Error('Failed to fetch loadouts');
    return res.json();
  },

  update: async (id: string, payload: CreateLoadoutPayload): Promise<Loadout> => {
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
  }
};


// -----------------------------------------------------------------------------
// Maintenance Log API
// -----------------------------------------------------------------------------
export interface MaintenanceLog {
  id: string;
  itemId: string;
  logDate: string;
  actionTaken: string;
  cost: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaintenancePayload {
  itemId: string;
  logDate: string; // YYYY-MM-DD
  actionTaken: string;
  cost: number;
}

export const maintenanceApi = {
  getLogsForItem: async (itemId: string): Promise<MaintenanceLog[]> => {
    const res = await fetch(`${getBaseUrl()}/maintenance/item/${itemId}`, { 
      cache: 'no-store' 
    });
    if (!res.ok) throw new Error('Failed to fetch maintenance logs');
    return res.json();
  },

  addLog: async (payload: CreateMaintenancePayload): Promise<MaintenanceLog> => {
    const res = await fetch(`${getBaseUrl()}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to add maintenance log: ${res.statusText}`);
    return res.json();
  },

  updateLog: async (id: string, payload: CreateMaintenancePayload): Promise<MaintenanceLog> => {
    const res = await fetch(`${getBaseUrl()}/maintenance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to update maintenance log`);
    return res.json();
  },

  deleteLog: async (id: string): Promise<void> => {
    const res = await fetch(`${getBaseUrl()}/maintenance/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to delete maintenance log: ${res.statusText}`);
  }
};

// --- Dashboard API ---

export interface CategoryStat {
  category: string;
  count: number;
  totalWeight: number;
}

export interface DashboardStats {
  totalItems: number;
  totalWeight: number;
  totalLoadouts: number;
  totalCost: number;
  categoryStats: CategoryStat[];
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await fetch(`${getBaseUrl()}/dashboard/stats`, { 
      cache: 'no-store' 
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  }
};

export interface Trip {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  items?: GearItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripPayload {
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
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

  removeItems: async (tripId: string, itemIds: string[]): Promise<void> => {
    const res = await fetch(`${getBaseUrl()}/trips/${tripId}/items`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemIds }),
    });
    if (!res.ok) throw new Error('Failed to remove items from trip');
  }
};