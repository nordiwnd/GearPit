import { TripItem } from "@/lib/api";

export interface WeightStats {
  total: number;      // Total weight in pack (Base + Consumable + Long)
  base: number;       // Carried base weight
  consumable: number; // Food, water, fuel
  worn: number;       // Items worn on body
  long: number;       // Long gear like skis/poles
}

export type CategoryItems = Record<'wearable' | 'pack' | 'essentials' | 'long_gear', TripItem[]>;

/**
 * Categorizes trip items based on weightType and tags.
 * Priority: 
 * 1. WeightType 'worn' -> wearable
 * 2. WeightType 'consumable' -> pack/consumable
 * 3. WeightType 'long' -> long_gear
 * 4. Tag 'essentials' -> essentials
 * 5. Default -> pack
 */
export function categorizeTripItems(items: TripItem[]): CategoryItems {
  const result: CategoryItems = {
    wearable: [],
    pack: [],
    essentials: [],
    long_gear: [],
  };

  items.forEach(item => {
    const weightType = item.item.weightType;
    const tags = item.item.tags?.map(t => t.toLowerCase()) || [];

    if (weightType === 'worn') {
      result.wearable.push(item);
    } else if (weightType === 'long') {
      result.long_gear.push(item);
    } else if (weightType === 'accessory' || tags.includes('essentials') || tags.includes('safety') || tags.includes('electronics')) {
      result.essentials.push(item);
    } else {
      // both 'base' and 'consumable' go into Pack
      result.pack.push(item);
    }
  });

  return result;
}

/**
 * Calculates total weight statistics for a trip.
 */
export function calculateTripStats(items: TripItem[]): WeightStats {
  const stats: WeightStats = {
    total: 0,
    base: 0,
    consumable: 0,
    worn: 0,
    long: 0,
  };

  items.forEach(ti => {
    const weight = ti.item.weightGram * ti.quantity;
    const type = ti.item.weightType;

    if (type === 'worn') {
      stats.worn += weight;
    } else if (type === 'long') {
      stats.long += weight;
      stats.total += weight;
    } else if (type === 'consumable') {
      stats.consumable += weight;
      stats.total += weight;
    } else {
      // Default to base weight
      stats.base += weight;
      stats.total += weight;
    }
  });

  return stats;
}
