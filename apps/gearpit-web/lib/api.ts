import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const gearApi = {
  createItem: async (payload: CreateGearPayload): Promise<GearItem> => {
    const res = await fetch(`${API_BASE_URL}/gears`, {
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
    const res = await fetch(`${API_BASE_URL}/gears`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch gears');
    return res.json();
  }
};