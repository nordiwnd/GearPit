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
        <div className="h-full flex flex-col space-y-4 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Loadouts</h1>
                    <p className="text-muted-foreground text-xs">Manage your gear sets and packing lists.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button asChild size="sm">
                        <Link href="/loadouts/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Loadout
                        </Link>
                    </Button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden rounded-md border bg-background shadow-sm">
                {loading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                ) : (
                    <DataTable columns={columns} data={data} />
                )}
            </div>
        </div>
    )
}
