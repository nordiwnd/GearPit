"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { LoadoutDetail, PackingCategory } from "@/types/models"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator" // separator.tsx might fail if not exists. I'll check or remove if fails.
// Assuming Separator exists or I'll implement it or use <hr>. 
// Wait, generic <hr> with className is fine.
import { ArrowLeft, CalendarPlus } from "lucide-react"
import { GroupedGearList, GroupedCategoryData } from "@/components/grouped-gear-list"
import { CreateTripDialog } from "@/components/create-trip-dialog"

export default function LoadoutDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const [loadoutDetail, setLoadoutDetail] = useState<LoadoutDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [createTripOpen, setCreateTripOpen] = useState(false)

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
                quantity: detail.item.quantity,
                subtotalWeight: detail.subtotal_weight_g
            }))
        }
    }).filter(cat => cat.items.length > 0)

    const handleDeleteItem = async (itemId: string, gearId: string) => {
        // Implement delete logic if needed
        console.log("Delete item", itemId)
    }

    return (
        <div className="flex flex-col h-full space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{loadout.name}</h1>
                        {loadout.description && <p className="text-muted-foreground text-sm">{loadout.description}</p>}
                    </div>
                </div>
                <Button onClick={() => setCreateTripOpen(true)}>
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Plan Trip
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        <CardTitle className="text-sm font-medium">Base Weight (Pack)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pack_weight_g} g</div>
                        <p className="text-xs text-muted-foreground">Without worn/consumables</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Worn Weight</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{worn_weight_g} g</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Consumable Weight</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{consumable_weight_g} g</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <GroupedGearList
                    categories={groupedCategories}
                    onRemoveItem={handleDeleteItem}
                />
            </div>

            <CreateTripDialog
                open={createTripOpen}
                onOpenChange={setCreateTripOpen}
                baseLoadoutId={loadout.id}
            />
        </div>
    )
}
