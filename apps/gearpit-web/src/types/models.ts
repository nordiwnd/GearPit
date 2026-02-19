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
