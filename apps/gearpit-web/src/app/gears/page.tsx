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
        <div className="flex flex-col h-full bg-[#18181B] text-zinc-200 p-6 md:p-8">
            <div className="max-w-7xl mx-auto w-full flex flex-col h-full space-y-6">
                <div className="flex-none flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Gear Command Center</h1>
                        <p className="text-sm text-zinc-400">Manage your inventory efficiently.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Input
                            placeholder="Filter gears..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500 w-[250px]"
                        />
                        <AddGearDialog onSuccess={handleAddGear} />
                    </div>
                </div>
                {selectedGearIds.length > 0 && (
                    <div className="flex-none flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-md">
                        <span className="text-sm font-medium text-emerald-400">{selectedGearIds.length} items selected</span>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-[0_0_15px_rgba(5,150,105,0.2)] transition-colors" onClick={() => setCreateLoadoutOpen(true)}>
                            Create Loadout
                        </Button>
                    </div>
                )}
                <div className="flex-1 overflow-auto rounded-md shadow-sm">
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
