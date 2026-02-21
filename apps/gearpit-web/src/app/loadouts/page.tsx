"use client"

import { useState, useEffect } from "react"
import { DataTable } from "./data-table"
import { columns } from "./columns" // Import from local columns.tsx
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loadout } from "@/types/models"
import { Plus } from "lucide-react"

export default function LoadoutPage() {
    const [data, setData] = useState<Loadout[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLoadouts = async () => {
            try {
                const response = await fetch('/api/loadouts')
                if (!response.ok) {
                    throw new Error('Failed to fetch loadouts')
                }
                const data = await response.json()
                setData(data)
            } catch (error) {
                console.error("Error fetching loadouts:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchLoadouts()
    }, [])

    return (
        <div className="flex flex-col h-full bg-[#18181B] text-zinc-200 p-6 md:p-8">
            <div className="max-w-7xl mx-auto w-full flex flex-col h-full space-y-6">
                <div className="flex-none flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Loadouts</h1>
                        <p className="text-sm text-zinc-400">Manage your gear sets and packing lists.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-[0_0_15px_rgba(5,150,105,0.3)] transition-colors">
                            <Link href="/loadouts/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Loadout
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto rounded-md shadow-sm">
                    {loading ? (
                        <div className="p-8 text-center text-zinc-500 font-mono text-sm uppercase tracking-widest">Loading Records...</div>
                    ) : (
                        <DataTable columns={columns} data={data} />
                    )}
                </div>
            </div>
        </div>
    )
}
