import { TripItem } from "@/lib/api";

export type TripCategory = 'wearable' | 'pack' | 'essentials' | 'long_gear' | 'consumable';

export interface CategorizedItems {
  wearable: TripItem[];
  pack: TripItem[];
  essentials: TripItem[];
  long_gear: TripItem[];
  consumable: TripItem[];
  uncategorized: TripItem[];
}

export interface WeightStats {
  total: number;
  base: number;
  consumable: number;
  worn: number;
}

export function categorizeTripItems(items: TripItem[]): CategorizedItems {
  const result: CategorizedItems = {
    wearable: [],
    pack: [],
    essentials: [],
    long_gear: [],
    consumable: [],
    uncategorized: []
  };

  items.forEach(item => {
    const tags = item.item.tags || [];
    
    // Check tags for categorization
    // Priority: Consumable > Long Gear > Wearable > Essentials > Pack
    if (tags.some(t => t.toLowerCase() === 'consumable' || t.toLowerCase() === 'food' || t.toLowerCase() === 'fuel')) {
      result.consumable.push(item);
    } else if (tags.some(t => t.toLowerCase() === 'long_gear' || t.toLowerCase() === 'ski' || t.toLowerCase() === 'pole')) {
      result.long_gear.push(item);
    } else if (tags.some(t => t.toLowerCase() === 'wearable' || t.toLowerCase() === 'clothing' || t.toLowerCase() === 'boots')) {
      result.wearable.push(item);
    } else if (tags.some(t => t.toLowerCase() === 'essentials' || t.toLowerCase() === 'safety' || t.toLowerCase() === 'first_aid' || t.toLowerCase() === 'electronics')) {
      result.essentials.push(item);
    } else if (tags.some(t => t.toLowerCase() === 'pack' || t.toLowerCase() === 'backpack')) {
      result.pack.push(item);
    } else {
      // Default to pack if it's not wearable/long/consumable, typical for hiking gear
      // But let's verify if there are other indicators. 
      // For now, if no specific tag matches, put in uncategorized (or pack? Design showed 'Backpack & Contents')
      // The design implies "Backpack & Contents" is the main bucket.
      result.pack.push(item); 
    }
  });

  return result;
}

export function calculateTripStats(items: TripItem[]): WeightStats {
  let total = 0;
  let base = 0;
  let consumable = 0;
  let worn = 0;

  items.forEach(ti => {
    const weight = ti.item.weightGram * ti.quantity;
    const tags = ti.item.tags || [];
    
    total += weight;

    if (tags.some(t => t.toLowerCase() === 'consumable')) {
        consumable += weight;
    } else if (tags.some(t => t.toLowerCase() === 'wearable')) {
        worn += weight;
    } else {
        base += weight;
    }
  });

  return { total, base, consumable, worn };
}
