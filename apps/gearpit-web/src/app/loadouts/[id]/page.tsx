"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { LoadoutDetail, PackingCategory } from "@/types/models"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator" // separator.tsx might fail if not exists. I'll check or remove if fails.
// Assuming Separator exists or I'll implement it or use <hr>. 
// Wait, generic <hr> with className is fine.
import { ArrowLeft, Box } from "lucide-react"
import { GroupedGearList, GroupedCategoryData } from "@/components/grouped-gear-list"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function LoadoutDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const [loadoutDetail, setLoadoutDetail] = useState<LoadoutDetail | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return;

        const fetchLoadout = async () => {
            try {
                const response = await fetch(`/api/loadouts/${id}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch loadout')
                }
                const data = await response.json()
                setLoadoutDetail(data)
            } catch (error) {
                console.error("Error fetching loadout:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchLoadout()
    }, [id])

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading loadout details...</div>
    }

    if (!loadoutDetail) {
        return <div className="p-8 text-center text-muted-foreground">Loadout not found.</div>
    }

    const { loadout, items, total_weight_g, pack_weight_g, worn_weight_g, external_weight_g, consumable_weight_g, other_weight_g } = loadoutDetail

    // Group items by Packing Category
    const groupedItems: Record<string, typeof items> = {}
    items.forEach(item => {
        const cat = item.item.packing_category || 'Uncategorized'; // Or use default from gear if not set implementation-wise
        if (!groupedItems[cat]) groupedItems[cat] = []
        groupedItems[cat].push(item)
    })

    const categories = Object.keys(PackingCategory) as string[]

    const groupedCategories: GroupedCategoryData[] = categories.map((category: string) => {
        const categoryItems = groupedItems[category] || []
        const categoryTotal = categoryItems.reduce((sum, item) => sum + item.subtotal_weight_g, 0)

        return {
            categoryName: category,
            totalWeight: categoryTotal,
            items: categoryItems.map(detail => ({
                id: detail.item.id,
                gearId: detail.gear.id,
                name: detail.gear.name,
                manufacturer: detail.gear.manufacturer,
                category: detail.item.packing_category || detail.gear.default_packing_category || "Uncategorized",
                quantity: detail.item.quantity,
                unitWeight: detail.gear.weight_g,
                subtotalWeight: detail.gear.weight_g * detail.item.quantity
            }))
        }
    }).filter(cat => cat.items.length > 0)

    const handleDeleteItem = async (itemId: string, gearId: string) => {
        // Implement delete logic if needed
        console.log("Delete item", itemId)
    }

    // Calculate weight distribution percentages
    const totalWeightForBar = total_weight_g > 0 ? total_weight_g : 1; // prevent div by 0
    const packPct = (pack_weight_g / totalWeightForBar) * 100;
    const wornPct = (worn_weight_g / totalWeightForBar) * 100;
    const consumablePct = (consumable_weight_g / totalWeightForBar) * 100;

    return (
        <div className="flex flex-col h-full bg-[#18181B] text-zinc-200">
            <div className="w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col h-[calc(100vh-3rem)] gap-4">

                {/* ZONE 1: Context (Header & Metadata) - Fixed Top */}
                <div className="flex-none flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold tracking-tight text-white">{loadout.name}</h1>
                                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 font-mono">
                                    <Box className="w-3 h-3 mr-1" />
                                    BASE LOADOUT
                                </Badge>
                            </div>
                            {loadout.description && <p className="text-zinc-400 text-sm">{loadout.description}</p>}
                        </div>
                    </div>
                </div>

                {/* ZONE 2: Tactical Summary (KPI Panels) - Fixed Top */}
                <div className="flex-none grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-[#27272A] border-zinc-800 rounded-md shadow-sm">
                        <CardContent className="p-4 flex flex-row items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Sys Wt</span>
                            <div className="text-xl font-mono text-zinc-100">{total_weight_g} <span className="text-zinc-500 text-sm">g</span></div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#27272A] border-zinc-800 rounded-md shadow-sm">
                        <CardContent className="p-4 flex flex-row items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Base Pack Wt</span>
                            <div className="text-xl font-mono text-emerald-400">{pack_weight_g} <span className="text-emerald-700 text-sm">g</span></div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#27272A] border-zinc-800 rounded-md shadow-sm">
                        <CardContent className="p-4 flex flex-row items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Worn / Ext Wt</span>
                            <div className="text-xl font-mono text-zinc-100">{worn_weight_g + external_weight_g} <span className="text-zinc-500 text-sm">g</span></div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#27272A] border-zinc-800 rounded-md shadow-sm">
                        <CardContent className="p-4 flex flex-row items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Consumables Wt</span>
                            <div className="text-xl font-mono text-zinc-100">{consumable_weight_g} <span className="text-zinc-500 text-sm">g</span></div>
                        </CardContent>
                    </Card>
                </div>

                {/* ZONE 3: Packing Matrix - Flex 1 (Scrollable Table Area) */}
                <div className="flex-1 overflow-auto min-h-0 w-full relative rounded-md border border-zinc-800 bg-zinc-900/40">
                    <GroupedGearList
                        categories={groupedCategories}
                        onRemoveItem={handleDeleteItem}
                    />
                </div>

                {/* Zone 4: Weight Distribution Bar at the bottom - Fixed Bottom */}
                <div className="flex-none flex flex-col space-y-2 pt-2">
                    <div className="flex justify-between items-center text-xs font-mono text-zinc-500 uppercase tracking-widest px-1">
                        <span>Weight Distribution Matrix</span>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Pack ({packPct.toFixed(1)}%)</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Worn ({wornPct.toFixed(1)}%)</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Consumables ({consumablePct.toFixed(1)}%)</span>
                        </div>
                    </div>
                    <div className="h-2 w-full flex rounded-sm overflow-hidden bg-zinc-800">
                        <div style={{ width: `${packPct}%` }} className="bg-emerald-500 h-full" title={`Pack: ${packPct.toFixed(1)}%`} />
                        <div style={{ width: `${wornPct}%` }} className="bg-blue-500 h-full bg-opacity-80" title={`Worn: ${wornPct.toFixed(1)}%`} />
                        <div style={{ width: `${consumablePct}%` }} className="bg-amber-500 h-full bg-opacity-80" title={`Consumables: ${consumablePct.toFixed(1)}%`} />
                    </div>
                </div>

            </div>
        </div>
    )
}
