"use client";

import { Droplets, Flame } from "lucide-react";

interface TripHydrationChartProps {
    hydration: number;
    calories: number;
}

export function TripHydrationChart({ hydration, calories }: TripHydrationChartProps) {
    // Max values for relative bar width context (optional, or just static max visual)
    // For now, we just show the values with a fixed visual style.

    return (
        <div className="flex flex-col gap-2 w-full max-w-sm border rounded-md p-3 bg-background shadow-sm">
            {/* Hydration Row */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                    <div className="flex items-center text-blue-600 gap-1">
                        <Droplets className="h-3 w-3" />
                        <span>Water Need</span>
                    </div>
                    <span className="text-blue-700 font-bold">{hydration} ml</span>
                </div>
                <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: '100%' }} // Just full bar for now as it represents "Total Need"
                    ></div>
                </div>
            </div>

            {/* Calories Row */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                    <div className="flex items-center text-orange-600 gap-1">
                        <Flame className="h-3 w-3" />
                        <span>Calorie Need</span>
                    </div>
                    <span className="text-orange-700 font-bold">{calories} kcal</span>
                </div>
                <div className="h-2 w-full bg-orange-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: '100%' }}
                    ></div>
                </div>
            </div>
        </div>
    );
}
