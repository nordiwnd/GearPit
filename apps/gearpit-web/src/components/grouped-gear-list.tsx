import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface GroupedCategoryData {
    categoryName: string
    totalWeight: number
    items: GroupedItemData[]
}

export interface GroupedItemData {
    id: string      // The linking ID (e.g., trip_item.id or loadout_item.id)
    gearId: string  // To link to gear details if needed
    name: string
    quantity: number
    subtotalWeight: number
}

interface GroupedGearListProps {
    categories: GroupedCategoryData[]
    onRemoveItem?: (itemId: string, gearId: string) => void
}

export function GroupedGearList({ categories, onRemoveItem }: GroupedGearListProps) {
    if (!categories || categories.length === 0) {
        return <div className="text-muted-foreground text-center p-4 border rounded-lg bg-muted/20">No items added yet.</div>
    }

    return (
        <div className="space-y-6">
            {categories.map((cat) => {
                if (!cat.items || cat.items.length === 0) return null

                return (
                    <div key={cat.categoryName} className="space-y-2">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="text-lg font-semibold">{cat.categoryName === "null" ? "Uncategorized" : cat.categoryName}</h3>
                            <span className="text-sm text-muted-foreground font-medium">{cat.totalWeight} g</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {cat.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
                                    <div className="flex items-center space-x-4">
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-sm text-muted-foreground">x{item.quantity}</div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-sm font-mono">{item.subtotalWeight} g</div>
                                        {onRemoveItem && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                                onClick={() => onRemoveItem(item.id, item.gearId)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
