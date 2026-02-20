"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { TripDetails, PackingCategory } from "@/types/models"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit3 } from "lucide-react"
import { GroupedGearList, GroupedCategoryData } from "@/components/grouped-gear-list"
import { AddGearToTripDialog } from "@/components/add-gear-to-trip-dialog"

export default function TripDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const [tripDetail, setTripDetail] = useState<TripDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [addGearOpen, setAddGearOpen] = useState(false)

    const fetchTrip = async () => {
        try {
            const response = await fetch(`/api/trips/${id}`)
            if (!response.ok) {
                throw new Error('Failed to fetch trip')
            }
            const data = await response.json()
            setTripDetail(data)
        } catch (error) {
            console.error("Error fetching trip:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!id) return;
        fetchTrip()
    }, [id])

    const handleDeleteItem = async (itemId: string, gearId: string) => {
        try {
            const response = await fetch(`/api/trips/${id}/items/${gearId}`, {
                method: 'DELETE',
            })
            if (!response.ok) throw new Error("Failed to delete item")

            // Refresh
            fetchTrip()
        } catch (err) {
            console.error(err)
        }
    }

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading trip details...</div>
    }

    if (!tripDetail) {
        return <div className="p-8 text-center text-muted-foreground">Trip not found.</div>
    }

    const { trip, categories, total_weight_g, total_calories, water_ml } = tripDetail

    const groupedCategories: GroupedCategoryData[] = categories.map(cat => ({
        categoryName: cat.packing_category ? cat.packing_category : "Uncategorized",
        totalWeight: cat.subtotal_weight_g,
        items: cat.items.map(detail => ({
            id: detail.item.id,
            gearId: detail.gear.id,
            name: detail.gear.name,
            quantity: detail.item.quantity,
            subtotalWeight: detail.subtotal_weight_g
        }))
    }))

    return (
        <div className="flex flex-col h-full space-y-6 p-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{trip.name}</h1>
                    <div className="flex items-center space-x-2 text-muted-foreground text-sm mt-1">
                        <span>{new Date(trip.target_date).toLocaleString()}</span>
                        <span>•</span>
                        <span>{trip.planned_duration_minutes} min durations</span>
                        <span>•</span>
                        <span>{trip.elevation_gain_m}m elevation</span>
                    </div>
                    {trip.description && <p className="text-muted-foreground text-sm mt-1">{trip.description}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Weight</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{total_weight_g} g</div>
                        <p className="text-xs text-muted-foreground">{(total_weight_g / 1000).toFixed(2)} kg</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Est. Calories Needed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{total_calories} kcal</div>
                        <p className="text-xs text-muted-foreground">Based on weight, duration & elevation</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Est. Water Needed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{water_ml} ml</div>
                        <p className="text-xs text-muted-foreground">{(water_ml / 1000).toFixed(2)} L minimum</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Packed Gear</h2>
                <Button variant="outline" size="sm" onClick={() => setAddGearOpen(true)}>
                    <Edit3 className="mr-2 h-4 w-4" /> Add Gear
                </Button>
            </div>

            <div className="space-y-6">
                <GroupedGearList
                    categories={groupedCategories}
                    onRemoveItem={handleDeleteItem}
                />
            </div>

            <AddGearToTripDialog
                open={addGearOpen}
                onOpenChange={setAddGearOpen}
                tripId={trip.id}
                onSuccess={fetchTrip}
            />
        </div>
    )
}
