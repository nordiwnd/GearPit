export type Gear = {
    id: string
    name: string
    weight_g: number
    price: number
    manufacturer: string
    category: string
    properties: Record<string, unknown>
    created_at: string
}
