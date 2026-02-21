"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { TripDetails } from "@/types/models"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit3, Target, Droplet, Weight, Backpack } from "lucide-react"
import { GroupedGearList, GroupedCategoryData } from "@/components/grouped-gear-list"
import { AddGearToTripDialog } from "@/components/add-gear-to-trip-dialog"
import { Badge } from "@/components/ui/badge"

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
        return <div className="p-8 text-center text-zinc-500 font-mono text-sm uppercase tracking-widest">Initializing Tactical Command...</div>
    }

    if (!tripDetail) {
        return <div className="p-8 text-center text-red-500 font-mono tracking-widest uppercase">Trip Error: Not Found</div>
    }

    const { trip, categories, total_weight_g, total_calories, water_ml } = tripDetail

    const groupedCategories: GroupedCategoryData[] = categories.map(cat => ({
        categoryName: cat.packing_category ? cat.packing_category : "Uncategorized",
        totalWeight: cat.subtotal_weight_g,
        items: cat.items.map(detail => ({
            id: detail.item.id,
            gearId: detail.gear.id,
            name: detail.gear.name,
            manufacturer: detail.gear.manufacturer,
            category: detail.item.packing_category || detail.gear.default_packing_category || "Uncategorized",
            quantity: detail.item.quantity,
            unitWeight: detail.gear.weight_g,
            subtotalWeight: detail.gear.weight_g * detail.item.quantity
        }))
    }))

    // Calculate specific weights
    const wornWeight = categories.find(c => c.packing_category === "Worn")?.subtotal_weight_g || 0;
    const externalWeight = categories.find(c => c.packing_category === "External")?.subtotal_weight_g || 0;
    const packWeight = total_weight_g - wornWeight - externalWeight;

    const packWeightRatio = total_weight_g > 0 ? (packWeight / total_weight_g) * 100 : 0;
    const wornWeightRatio = total_weight_g > 0 ? (wornWeight / total_weight_g) * 100 : 0;
    const extWeightRatio = total_weight_g > 0 ? (externalWeight / total_weight_g) * 100 : 0;

    return (
        <div className="flex flex-col h-full bg-[#18181B] text-zinc-200">
            {/* Main Content Container with max width constraints */}
            <div className="w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col h-[calc(100vh-3rem)] gap-4">

                {/* ZONE 1: Context (Header & Metadata) - Fixed Top */}
                <div className="flex-none flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-start md:items-center space-x-4">
                        <Button variant="outline" size="icon" className="border-zinc-800 bg-[#27272A] hover:bg-zinc-700 hover:text-white shrink-0 mt-1 md:mt-0" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">{trip.name}</h1>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge className="bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs rounded-full border-none px-3">
                                    Date: {new Date(trip.target_date).toLocaleDateString('en-CA')}
                                </Badge>
                                <Badge className="bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs rounded-full border-none px-3">
                                    Base: {trip.planned_duration_minutes} MIN
                                </Badge>
                                <Badge className="bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs rounded-full border-none px-3">
                                    Elev. Gain: {trip.elevation_gain_m}m
                                </Badge>
                            </div>
                            {trip.description && <p className="text-zinc-500 text-sm mt-2 border-l-2 border-[#27272A] pl-3 leading-relaxed truncate">{trip.description}</p>}
                        </div>
                    </div>

                    <Button onClick={() => setAddGearOpen(true)} variant="ghost" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 font-medium shrink-0">
                        <Edit3 className="mr-2 h-4 w-4" /> Modify Loadout
                    </Button>
                </div>

                {/* ZONE 2 & 4: Tactical Summary (KPI Panels) - Fixed Top */}
                <div className="flex-none grid grid-cols-2 md:grid-cols-4 gap-4">

                    {/* Primary KPIs - Ultra Compact */}
                    <Card className="bg-[#27272A] border-zinc-800 rounded-md shadow-sm">
                        <div className="px-3 py-1.5 flex items-center justify-between">
                            <div className="text-[10px] font-semibold text-zinc-400 uppercase flex items-center gap-1.5 tracking-wider">
                                <Weight className="w-3 h-3 text-zinc-500" />
                                Total Weight
                            </div>
                            <div className="flex items-baseline gap-1">
                                <div className="text-lg font-bold font-mono text-orange-500 tracking-tight">{total_weight_g.toLocaleString()}</div>
                                <p className="text-[10px] font-semibold text-orange-500">g</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-[#27272A] border-zinc-800 rounded-md shadow-sm">
                        <div className="px-3 py-1.5 flex items-center justify-between">
                            <div className="text-[10px] font-semibold text-zinc-400 uppercase flex items-center gap-1.5 tracking-wider">
                                <Backpack className="w-3 h-3 text-zinc-500" />
                                Pack Weight
                            </div>
                            <div className="flex items-baseline gap-1">
                                <div className="text-lg font-bold font-mono text-orange-500 tracking-tight">{packWeight.toLocaleString()}</div>
                                <p className="text-[10px] font-semibold text-orange-500">g</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-[#27272A] border-zinc-800 rounded-md shadow-sm">
                        <div className="px-3 py-1.5 flex items-center justify-between">
                            <div className="text-[10px] font-semibold text-zinc-400 uppercase flex items-center gap-1.5 tracking-wider">
                                <Target className="w-3 h-3 text-zinc-500" />
                                Target Calories
                            </div>
                            <div className="flex items-baseline gap-1">
                                <div className="text-lg font-bold font-mono text-emerald-500 tracking-tight">{total_calories.toLocaleString()}</div>
                                <p className="text-[10px] font-semibold text-emerald-500">kcal</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-[#27272A] border-zinc-800 rounded-md shadow-sm">
                        <div className="px-3 py-1.5 flex items-center justify-between">
                            <div className="text-[10px] font-semibold text-zinc-400 uppercase flex items-center gap-1.5 tracking-wider">
                                <Droplet className="w-3 h-3 text-zinc-500" />
                                Req. Water
                            </div>
                            <div className="flex items-baseline gap-1">
                                <div className="text-lg font-bold font-mono text-emerald-500 tracking-tight">{water_ml >= 1000 ? (water_ml / 1000).toFixed(1) : water_ml}</div>
                                <p className="text-[10px] font-semibold text-emerald-500">{water_ml >= 1000 ? 'L' : 'ml'}</p>
                            </div>
                        </div>
                    </Card>

                </div>

                {/* ZONE 3: Packing Matrix - Flex 1 (Scrollable Table Area) */}
                <div className="flex-1 overflow-auto min-h-0 w-full relative">
                    <GroupedGearList
                        categories={groupedCategories}
                        onRemoveItem={handleDeleteItem}
                    />
                </div>

                {/* Zone 4: Weight Distribution Bar at the bottom - Fixed Bottom */}
                <div className="flex-none flex flex-col space-y-2">
                    {/* Distribution Legend */}
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-300 px-1">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-sm bg-orange-500" />Pack ({packWeightRatio.toFixed(0)}%)
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-400">
                            <div className="w-2 h-2 rounded-sm bg-zinc-500" />Worn ({wornWeightRatio.toFixed(0)}%)
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-sm bg-emerald-500" />External ({extWeightRatio.toFixed(0)}%)
                        </div>
                    </div>
                    {/* Github style breakdown bar */}
                    <div className="h-2 w-full bg-zinc-800 rounded-sm overflow-hidden flex">
                        {packWeightRatio > 0 && <div style={{ width: `${packWeightRatio}%` }} className="h-full bg-orange-500" title="Pack Weight" />}
                        {wornWeightRatio > 0 && <div style={{ width: `${wornWeightRatio}%` }} className="h-full bg-zinc-500" title="Worn Weight" />}
                        {extWeightRatio > 0 && <div style={{ width: `${extWeightRatio}%` }} className="h-full bg-emerald-500" title="External Weight" />}
                    </div>
                </div>

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
