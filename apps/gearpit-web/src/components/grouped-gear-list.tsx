import { Trash2, Package, Archive, Backpack, Pickaxe, Flame, Info, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface GroupedCategoryData {
    categoryName: string
    totalWeight: number
    items: GroupedItemData[]
}

export interface GroupedItemData {
    id: string
    gearId: string
    name: string
    manufacturer: string
    category: string
    quantity: number
    unitWeight: number
    subtotalWeight: number
}

interface GroupedGearListProps {
    categories: GroupedCategoryData[]
    onRemoveItem?: (itemId: string, gearId: string) => void
}

const CategoryIcon = ({ category }: { category: string }) => {
    switch (category) {
        case "Worn": return <Pickaxe className="w-4 h-4 text-zinc-500" />
        case "InPack": return <Backpack className="w-4 h-4 text-zinc-500" />
        case "External": return <Package className="w-4 h-4 text-zinc-500" />
        case "SmallStuff": return <Archive className="w-4 h-4 text-zinc-500" />
        case "Consumable": return <Flame className="w-4 h-4 text-zinc-500" />
        default: return <Info className="w-4 h-4 text-zinc-500" />
    }
}

function getCategoryDisplayName(cat: string) {
    if (cat === "Worn") return "WORN (着用)"
    if (cat === "InPack") return "IN PACK (ザック内)"
    if (cat === "External") return "EXTERNAL (外付け)"
    if (cat === "SmallStuff") return "SMALL STUFF (小物)"
    if (cat === "Consumable") return "CONSUMABLE (消耗品)"
    if (cat === "null" || cat === "Uncategorized") return "UNCATEGORIZED (未分類)"
    return cat.toUpperCase()
}

export function GroupedGearList({ categories, onRemoveItem }: GroupedGearListProps) {
    if (!categories || categories.length === 0) {
        return <div className="text-zinc-500 text-center p-8 border border-zinc-800 rounded-lg bg-zinc-900/50">No data available in Matrix.</div>
    }

    return (
        <div className="w-full flex-1 border border-zinc-800 rounded-md overflow-hidden bg-[#18181b]/50">
            <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm border-collapse">
                    <thead className="[&_tr]:border-b [&_tr]:border-zinc-800">
                        <tr className="border-b transition-colors hover:bg-zinc-800/10 data-[state=selected]:bg-zinc-800">
                            <th className="h-8 px-2 text-left align-middle font-medium text-zinc-400 w-10"></th>
                            <th className="h-8 px-2 text-left align-middle font-medium text-zinc-400">Name</th>
                            <th className="h-8 px-2 text-left align-middle font-medium text-zinc-400 w-48 hidden md:table-cell">Mfr.</th>
                            <th className="h-8 px-2 align-middle font-medium text-zinc-400 text-right w-16">Qty</th>
                            <th className="h-8 px-2 align-middle font-medium text-zinc-400 text-right w-24">Unit (g)</th>
                            <th className="h-8 px-2 align-middle font-medium text-zinc-400 text-right w-28">Subtotal (g)</th>
                            {onRemoveItem && <th className="h-8 px-2 align-middle font-medium text-zinc-400 w-10"></th>}
                        </tr>
                    </thead>

                    {categories.map((cat) => {
                        if (!cat.items || cat.items.length === 0) return null;
                        return (
                            <tbody key={cat.categoryName} className="[&_tr:last-child]:border-0">
                                {/* Category Header Row */}
                                <tr className="border-b border-zinc-800/60 bg-zinc-800/20 hover:bg-zinc-800/30 transition-colors">
                                    <td colSpan={1} className="p-2 align-middle">
                                        <div className="flex items-center text-zinc-400 text-xs pl-1">▼</div>
                                    </td>
                                    <td colSpan={2} className="p-2 align-middle font-semibold text-zinc-300">
                                        [{getCategoryDisplayName(cat.categoryName)}]
                                    </td>
                                    <td className="p-2 align-middle"></td>
                                    <td className="p-2 align-middle text-right text-zinc-400 text-xs hidden sm:table-cell">Unit (g)</td>
                                    <td className="p-2 align-middle text-right text-zinc-400 text-xs hidden sm:table-cell">Subtotal (g)</td>
                                    {onRemoveItem && <td className="p-2 align-middle"></td>}
                                </tr>

                                {/* Items */}
                                {cat.items.map((item) => (
                                    <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors group">
                                        <td className="p-2 align-middle text-center flex items-center justify-center space-x-1 opacity-70 group-hover:opacity-100">
                                            <GripVertical className="h-3 w-3 text-zinc-600 cursor-grab active:cursor-grabbing" />
                                            <CategoryIcon category={item.category} />
                                        </td>
                                        <td className="p-2 align-middle font-medium text-zinc-200 truncate max-w-[200px]" title={item.name}>
                                            {item.name}
                                        </td>
                                        <td className="p-2 align-middle text-zinc-400 truncate max-w-[150px] hidden md:table-cell" title={item.manufacturer || "-"}>
                                            {item.manufacturer || "-"}
                                        </td>
                                        <td className="p-2 align-middle text-right font-mono text-zinc-200">
                                            {item.quantity}
                                        </td>
                                        <td className="p-2 align-middle text-right font-mono text-zinc-400">
                                            {item.unitWeight ? item.unitWeight.toLocaleString() + " g" : "0 g"}
                                        </td>
                                        <td className="p-2 align-middle text-right font-mono text-zinc-200">
                                            {item.subtotalWeight ? item.subtotalWeight.toLocaleString() : "0"} g
                                        </td>
                                        {onRemoveItem && (
                                            <td className="p-2 align-middle">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                    onClick={() => onRemoveItem(item.id, item.gearId)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </td>
                                        )}
                                    </tr>
                                ))}

                                {/* Subtotal Row for InPack/Worn/External (Optional matching screenshot) */}
                                {(cat.categoryName === "InPack" || true) && (
                                    <tr className="border-b border-zinc-800 bg-zinc-900/30">
                                        <td colSpan={4} className="p-2 align-middle text-right font-semibold text-zinc-500 text-xs">
                                        </td>
                                        <td colSpan={2} className="p-2 align-middle text-right font-bold text-orange-500 font-mono tracking-tight text-sm">
                                            Subtotal: {cat.totalWeight.toLocaleString()} g
                                        </td>
                                        {onRemoveItem && <td className="p-2 align-middle"></td>}
                                    </tr>
                                )}
                            </tbody>
                        )
                    })}
                </table>
            </div>
        </div>
    )
}
