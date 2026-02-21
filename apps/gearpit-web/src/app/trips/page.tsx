"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Trip } from "@/types/models"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Navigation, CalendarPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { CreateTripDialog } from "@/components/create-trip-dialog"
import { DataTable } from "./data-table"
import { columns } from "./columns"

export default function TripsIndexPage() {
    const [trips, setTrips] = useState<Trip[]>([])
    const [loading, setLoading] = useState(true)
    const [createTripOpen, setCreateTripOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const response = await fetch('/api/trips')
                if (response.ok) {
                    const data = await response.json()
                    setTrips(data)
                }
            } catch (error) {
                console.error("Failed to fetch trips", error)
            } finally {
                setLoading(false)
            }
        }
        fetchTrips()
    }, [])

    return (
        <div className="flex flex-col h-full overflow-auto bg-[#18181B] text-zinc-200 p-6 md:p-8">
            <div className="max-w-4xl mx-auto w-full space-y-6">

                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="icon" className="border-zinc-800 bg-[#27272A] hover:bg-zinc-700 hover:text-white shrink-0" onClick={() => router.push('/index')}>
                            <Navigation className="h-4 w-4" />
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight text-white">All Trips</h1>
                    </div>
                    <Button onClick={() => setCreateTripOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shrink-0 shadow-[0_0_15px_rgba(5,150,105,0.3)] duration-200 transition-colors">
                        <CalendarPlus className="mr-2 h-4 w-4" /> Plan Trip
                    </Button>
                </div>

                <div className="flex-1 overflow-auto rounded-md shadow-sm">
                    {loading ? (
                        <div className="p-8 text-center text-zinc-500 font-mono text-sm uppercase tracking-widest">Loading Trips...</div>
                    ) : (
                        <DataTable columns={columns} data={trips} />
                    )}
                </div>
            </div>

            <CreateTripDialog
                open={createTripOpen}
                onOpenChange={setCreateTripOpen}
            />
        </div>
    )
}
