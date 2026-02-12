"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TripItem } from "@/lib/api";
import { Edit2, Minus, Plus, Trash2, Box } from "lucide-react";
import { EditGearDialog } from "@/components/inventory/edit-gear-dialog";

interface GearCategoryCardProps {
    title: string;
    items: TripItem[];
    icon?: React.ReactNode;
    totalWeight: number;
    onUpdateQuantity: (itemId: string, currentQty: number, change: number) => void;
    onRemoveItem: (itemId: string) => void;
    variant?: 'default' | 'featured'; // 'featured' could be for Wearable System to make it larger
}

export function GearCategoryCard({
    title,
    items,
    icon,
    totalWeight,
    onUpdateQuantity,
    onRemoveItem,
    variant = 'default'
}: GearCategoryCardProps) {

    return (
        <Card className={`h-full flex flex-col ${variant === 'featured' ? 'border-primary/20 bg-primary/5' : ''}`}>
            <CardHeader className="pb-2 border-b">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {icon || <Box className="h-4 w-4 text-muted-foreground" />}
                        <CardTitle className="text-base font-semibold uppercase tracking-wide">{title}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="font-mono">
                        {(totalWeight / 1000).toFixed(1)}kg
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[300px] md:h-[400px]">
                    <div className="divide-y">
                        {items.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                No items in this category.
                            </div>
                        ) : (
                            items.map((ti) => (
                                <div key={ti.itemId} className="flex items-center justify-between p-3 hover:bg-muted/30 group transition-colors">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm truncate">{ti.item.name}</span>
                                            {ti.item.properties?.brand && (
                                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">{ti.item.properties.brand}</Badge>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground flex gap-2">
                                            <span>{(ti.item.weightGram * ti.quantity)}g</span>
                                            {ti.quantity > 1 && <span>({ti.item.weightGram}g ea)</span>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => onUpdateQuantity(ti.itemId, ti.quantity, -1)}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-4 text-center text-xs font-mono">{ti.quantity}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => onUpdateQuantity(ti.itemId, ti.quantity, 1)}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <EditGearDialog
                                            item={ti.item}
                                            trigger={
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
                                            }
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => onRemoveItem(ti.itemId)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
