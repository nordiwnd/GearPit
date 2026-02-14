"use client";

import { Minus, Plus, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TripHikingHoursProps {
    hours: number;
    onUpdate: (newHours: number) => void;
    loading?: boolean;
}

export function TripHikingHours({ hours, onUpdate, loading = false }: TripHikingHoursProps) {
    return (
        <div className="flex items-center gap-2 bg-muted/50 px-2.5 py-1 rounded-md border border-transparent hover:border-border transition-colors group">
            <Timer className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium min-w-[3ch] text-center">{hours.toFixed(1)}h</span>

            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => onUpdate(hours - 0.5)}
                    disabled={loading || hours <= 0}
                >
                    <Minus className="h-3 w-3" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => onUpdate(hours + 0.5)}
                    disabled={loading}
                >
                    <Plus className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}
