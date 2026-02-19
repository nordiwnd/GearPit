"use client"

import { useState, useEffect } from "react"
import { useQueryState, parseAsInteger } from 'nuqs'
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Input } from "@/components/ui/input"
import { AddGearDialog, AddGearFormValues } from "@/components/add-gear-dialog"
import { CreateLoadoutFromSelectionDialog } from "@/components/create-loadout-dialog"
import { Button } from "@/components/ui/button" // Re-export check (Input was here)
import { Gear } from "./schema"

const generateMockGears = (count: number, query: string): Gear[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: crypto.randomUUID(),
        name: `Gear Item ${i + 1}`,
        weight_g: 100 + i * 10,
        price: 50 + i * 5,
        manufacturer: ["Black Diamond", "Petzl", "Osprey", "MSR", "Scarpa"][i % 5],
        category: ["Ski", "Backpack", "Tent", "Pole", "Boots"][i % 5],
        properties: {}, // Mock properties could be added here if needed for deeper testing
        created_at: new Date().toISOString(),
    })).filter(g => !query || g.name.toLowerCase().includes(query.toLowerCase()))
}

import { Suspense } from "react"

function GearPageContent() {
    const [q, setQ] = useQueryState('q', { defaultValue: '' })
    const [data, setData] = useState<Gear[]>([])
    const [isMounted, setIsMounted] = useState(false)
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
    const [createLoadoutOpen, setCreateLoadoutOpen] = useState(false)

    // Compute selected gear IDs
    const selectedGearIds = Object.keys(rowSelection).filter(id => rowSelection[id])

    useEffect(() => {
        setIsMounted(true)
        const fetchGears = async () => {
            try {
                const res = await fetch('/api/gears')
                if (!res.ok) throw new Error('Failed to fetch gears')
                const gears = await res.json()
                setData(gears)
            } catch (error) {
                console.error("Error fetching gears:", error)
            }
        }
        fetchGears()
    }, [])

    // Filter in-memory for now, assuming standard API returns all (or implement search param later)
    const filteredData = data.filter(g => !q || g.name.toLowerCase().includes(q.toLowerCase()))

    if (!isMounted) return null

    const handleAddGear = (newGear: Gear) => {
        setData((prev) => [newGear, ...prev])
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
            {selectedGearIds.length > 0 && (
                <div className="flex items-center space-x-2 bg-muted/40 p-2 rounded-md">
                    <span className="text-xs font-medium">{selectedGearIds.length} items selected</span>
                    <Button size="sm" variant="secondary" onClick={() => setCreateLoadoutOpen(true)}>
                        Create Loadout
                    </Button>
                </div>
            )}
            <div className="flex-1 overflow-hidden rounded-md border bg-background shadow-sm">
                <DataTable
                    columns={columns}
                    data={filteredData}
                    rowSelection={rowSelection}
                    setRowSelection={setRowSelection}
                    getRowId={(row) => row.id}
                />
            </div>
            <CreateLoadoutFromSelectionDialog
                open={createLoadoutOpen}
                onOpenChange={setCreateLoadoutOpen}
                selectedGearIds={selectedGearIds}
            />
        </div>
    )
}

export default function GearPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GearPageContent />
        </Suspense>
    )
}
