export enum PackingCategory {
    Worn = "Worn",
    InPack = "InPack",
    External = "External",
    SmallStuff = "SmallStuff",
    Consumable = "Consumable",
    Other = "Other"
}

export type Gear = {
    id: string
    name: string
    weight_g: number
    price: number
    manufacturer: string
    category: string
    default_packing_category?: PackingCategory | null
    properties: Record<string, unknown>
    created_at: string
}

export type Loadout = {
    id: string
    user_id: string
    name: string
    description?: string | null
    created_at: string
    updated_at: string
}

export type LoadoutItem = {
    id: string
    loadout_id: string
    gear_id: string
    quantity: number
    packing_category?: PackingCategory | null
    created_at: string
    updated_at: string
}

export type LoadoutDetail = {
    loadout: Loadout
    items: LoadoutItemDetail[]
    total_weight_g: number
    pack_weight_g: number
    worn_weight_g: number
    external_weight_g: number
    consumable_weight_g: number
    other_weight_g: number
}

export type LoadoutItemDetail = {
    item: LoadoutItem
    gear: Gear
    subtotal_weight_g: number
}

export type Trip = {
    id: string
    user_id: string
    name: string
    target_date: string
    description?: string | null
    base_loadout_id?: string | null
    planned_duration_minutes: number
    elevation_gain_m: number
    created_at: string
    updated_at: string
}

export type TripItem = {
    id: string
    trip_id: string
    gear_id: string
    quantity: number
    packing_category?: PackingCategory | null
    created_at: string
    updated_at: string
}

export type TripItemWithGear = {
    item: TripItem
    gear: Gear
    subtotal_weight_g: number
}

export type TripCategorySummary = {
    category: PackingCategory | null
    items: TripItemWithGear[]
    total_weight_g: number
}

export type TripDetails = {
    trip: Trip
    categories: TripCategorySummary[]
    total_weight_g: number
    calories_needed: number
    water_needed_ml: number
}
