"use client"

import { useQueryState, parseAsInteger } from 'nuqs'
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Gear } from "./schema"

// Mock data generator
const generateMockGears = (count: number): Gear[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: crypto.randomUUID(),
        name: `Gear Item ${i + 1}`,
        weight_g: Math.floor(Math.random() * 1000),
        price: Math.floor(Math.random() * 500),
        category: ["Hiking", "Camping", "Climbing"][Math.floor(Math.random() * 3)],
        properties: {},
        created_at: new Date().toISOString(),
    }))
}

const data = generateMockGears(20)

export default function GearPage() {
    const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-4">Gear Inventory</h1>
            <DataTable columns={columns} data={data} />
        </div>
    )
}
