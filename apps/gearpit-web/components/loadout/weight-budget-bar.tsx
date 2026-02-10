import React, { useMemo, useState } from 'react';
import { GearItem } from '@/lib/api';
import { cn } from "@/lib/utils";
import { Scale, AlertTriangle, Settings2, X, Check } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface WeightBudgetBarProps {
    items: GearItem[];
    targetWeightGram?: number;
    onTargetChange?: (val: number | undefined) => void;
    className?: string;
}

export function WeightBudgetBar({ items, targetWeightGram, onTargetChange, className }: WeightBudgetBarProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempBudget, setTempBudget] = useState<string>(targetWeightGram?.toString() || "");

    const stats = useMemo(() => {
        let total = 0;
        let base = 0;
        let consumable = 0;
        let worn = 0;

        items.forEach(item => {
            const w = item.weightGram || 0;
            total += w;
            switch (item.weightType) {
                case 'consumable':
                    consumable += w;
                    break;
                case 'worn':
                    worn += w;
                    break;
                default:
                    base += w;
            }
        });

        return { total, base, consumable, worn };
    }, [items]);

    const hasBudget = targetWeightGram !== undefined && targetWeightGram > 0;
    const isOverweight = hasBudget && stats.total > targetWeightGram!;

    const denominator = hasBudget ? targetWeightGram! : (stats.total || 1);

    // Calculate widths relative to denominator (capped at 100% for individual segments if not compressed)
    // If overweight, we scale everything down so it fits in 100%
    const totalWeight = stats.total;
    const scaleFactor = (hasBudget && totalWeight > denominator) ? (denominator / totalWeight) : 1;

    // Percentage relative to the BAR WIDTH (which is 100% of container)
    // If hasBudget: Bar Width = Target. 
    // If Overweight: Bar Width represents Target, but content flows over? 
    // OR we always normalize to "Max(Total, Target)" ?
    // Let's stick to "Container = 100%".
    // If hasBudget:
    //    If Total < Target: Total occupies (Total/Target)% of width.
    //    If Total > Target: Total occupies 100% of width? And we show warning.
    //    Actually, if Total > Target, we want to show that it is full.

    // Let's define the "100% width" as Math.max(stats.total, targetWeightGram)
    const maxValue = hasBudget ? Math.max(stats.total, targetWeightGram!) : stats.total;
    const safeMax = maxValue || 1;

    // Calculate percentages relative to the container width
    const basePct = (stats.base / safeMax) * 100;
    const consPct = (stats.consumable / safeMax) * 100;
    const wornPct = (stats.worn / safeMax) * 100;

    // If there is a budget, we might want to show a marker line at the budget limit if Budget < Total.
    // Since we set maxValue = Max(Total, Budget), if Budget < Total, the Budget line is at (Budget/Total)*100 %.
    const budgetPct = hasBudget ? (targetWeightGram! / safeMax) * 100 : 0;

    const handleSave = () => {
        const val = parseInt(tempBudget);
        if (!isNaN(val) && val > 0) {
            onTargetChange?.(val);
        } else {
            onTargetChange?.(undefined);
        }
        setIsEditing(false);
    };

    return (
        <div className={cn("sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b py-2 px-4 shadow-sm transition-all", className)}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <Scale className={cn("h-4 w-4", isOverweight ? "text-destructive" : "text-muted-foreground")} />
                    <span className={cn("text-sm font-medium tabular-nums", isOverweight && "text-destructive")}>
                        {stats.total.toLocaleString()}g
                        {hasBudget && <span className="text-muted-foreground ml-1">/ {targetWeightGram?.toLocaleString()}g</span>}
                    </span>
                    {isOverweight && (
                        <span className="flex items-center text-xs text-destructive font-bold animate-pulse">
                            <AlertTriangle className="h-3 w-3 mr-1" /> Over Budget
                        </span>
                    )}
                </div>

                {onTargetChange && (
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <div className="flex items-center gap-1 animate-in slide-in-from-right-5 fade-in duration-200">
                                <Label htmlFor="budget-input" className="sr-only">Budget</Label>
                                <Input
                                    id="budget-input"
                                    type="number"
                                    className="h-7 w-20 text-xs px-2"
                                    value={tempBudget}
                                    onChange={(e) => setTempBudget(e.target.value)}
                                    placeholder="g"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSave();
                                        }
                                    }}
                                />
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50" onClick={handleSave}>
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={() => setIsEditing(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={() => {
                                setTempBudget(targetWeightGram?.toString() || "");
                                setIsEditing(true);
                            }}>
                                <Settings2 className="h-3 w-3 mr-1" />
                                {hasBudget ? 'Edit Budget' : 'Set Budget'}
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <div className="relative h-3 w-full bg-secondary/50 rounded-full overflow-hidden flex">
                <div style={{ width: `${basePct}%` }} className="h-full bg-emerald-500 transition-all duration-500" title={`Base: ${stats.base}g`} />
                <div style={{ width: `${consPct}%` }} className="h-full bg-blue-500 transition-all duration-500" title={`Consumable: ${stats.consumable}g`} />
                <div style={{ width: `${wornPct}%` }} className="h-full bg-rose-500 transition-all duration-500" title={`Worn: ${stats.worn}g`} />

                {/* Budget Limit Marker (only if Budget < Total, meaning we are over budget and the bar represents Total) */}
                {hasBudget && budgetPct < 100 && (
                    <div
                        className="absolute top-0 bottom-0 w-0.5 bg-destructive z-10 shadow-[0_0_4px_rgba(0,0,0,0.5)]"
                        style={{ left: `${budgetPct}%` }}
                        title={`Budget Limit: ${targetWeightGram}g`}
                    />
                )}
            </div>

            {/* Legend / Info */}
            <div className="flex justify-start gap-4 mt-1 text-[10px] text-muted-foreground">
                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-1" /> Base: {stats.base.toLocaleString()}g</div>
                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-blue-500 mr-1" /> Consumable: {stats.consumable.toLocaleString()}g</div>
                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-rose-500 mr-1" /> Worn: {stats.worn.toLocaleString()}g</div>
            </div>
        </div>
    );
}
