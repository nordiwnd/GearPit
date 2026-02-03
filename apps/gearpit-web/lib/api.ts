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

const getBaseUrl = () => {
  if (typeof window === "undefined") {
    // 1. Server-side (SSR): 直接K8sの内部DNSを叩く
    return process.env.INTERNAL_API_URL || "http://gearpit-app-svc/api/v1";
  }
  // 2. Client-side (Browser): 相対パスを使用し、Next.jsのrewrites経由で転送させる
  return "/api/v1";
};

export const gearApi = {
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

  listItems: async (): Promise<GearItem[]> => {
    const res = await fetch(`${getBaseUrl()}/gears`, { 
      cache: 'no-store' 
    });
    if (!res.ok) throw new Error('Failed to fetch gears');
    return res.json();
  }
};