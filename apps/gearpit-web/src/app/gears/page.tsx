"use client"

import { useState, useEffect } from "react"
import { useQueryState, parseAsInteger } from 'nuqs'
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Input } from "@/components/ui/input"
import { AddGearDialog, AddGearFormValues } from "@/components/add-gear-dialog"
import { Gear } from "./schema"

const generateMockGears = (count: number, query: string): Gear[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: crypto.randomUUID(),
        name: `Gear Item ${i + 1}`,
        weight_g: 100 + i * 10,
        price: 50 + i * 5,
        category: ["Hiking", "Camping", "Climbing"][i % 3],
        properties: {},
        created_at: new Date().toISOString(),
    })).filter(g => !query || g.name.toLowerCase().includes(query.toLowerCase()))
}

export default function GearPage() {
    const [q, setQ] = useQueryState('q', { defaultValue: '' })
    const [data, setData] = useState<Gear[]>([])
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        setData(generateMockGears(50, q))
    }, [q])

    if (!isMounted) return null

    const handleAddGear = (newGear: AddGearFormValues) => {
        const gear: Gear = {
            id: crypto.randomUUID(),
            name: newGear.name,
            weight_g: newGear.weight_g,
            price: newGear.price,
            category: newGear.category,
            properties: {},
            created_at: new Date().toISOString(),
        }
        setData(prev => [gear, ...prev])
    }

    return (
        <div className="h-full flex flex-col space-y-4 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Gear Command Center</h1>
                    <p className="text-muted-foreground text-xs">Manage your inventory efficiently.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Input
                        placeholder="Filter gears..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="h-8 w-[250px] text-xs"
                    />
                    <AddGearDialog onSuccess={handleAddGear} />
                </div>
            </div>
            <div className="flex-1 overflow-hidden rounded-md border bg-background shadow-sm">
                <DataTable columns={columns} data={data} />
            </div>
        </div>
    )
}
