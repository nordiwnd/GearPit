"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeightStats } from "@/lib/utils/trip-utils";
import { Backpack } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

interface TripStatsProps {
    stats: WeightStats;
    hydration?: number;
    calories?: number;
}

const COLORS = ['#3b82f6', '#94a3b8']; // Blue for Base, Gray for Consumable

export function TripStats({ stats, hydration, calories }: TripStatsProps) {
    const pieData = [
        { name: 'Base Weight', value: stats.base },
        { name: 'Consumables', value: stats.consumable },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Wearable Weight */}
            <Card className="bg-muted/50 border-none shadow-sm col-span-1">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Wear Weight
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-1">
                        <span className="text-2xl font-bold">{(stats.worn / 1000).toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground mb-1">kg</span>
                    </div>
                </CardContent>
            </Card>

            {/* Pack Weight */}
            <Card className="bg-muted/50 border-none shadow-sm col-span-1">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Pack Weight
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-1">
                        <span className="text-2xl font-bold">{(stats.total / 1000).toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground mb-1">kg</span>
                    </div>
                </CardContent>
            </Card>

            {/* Hydration */}
            <Card className="bg-blue-50/50 border-none shadow-sm col-span-1">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-600/80 uppercase tracking-wider">
                        Water
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-1">
                        <span className="text-2xl font-bold text-blue-700">{hydration || 0}</span>
                        <span className="text-sm text-blue-600/60 mb-1">ml</span>
                    </div>
                </CardContent>
            </Card>

            {/* Calories */}
            <Card className="bg-orange-50/50 border-none shadow-sm col-span-1">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-orange-600/80 uppercase tracking-wider">
                        Calories
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-1">
                        <span className="text-2xl font-bold text-orange-700">{calories || 0}</span>
                        <span className="text-sm text-orange-600/60 mb-1">kcal</span>
                    </div>
                </CardContent>
            </Card>

            {/* Visual Weight Breakdown - Pie Chart */}
            <Card className="bg-white border-none shadow-sm flex flex-col justify-center col-span-1 h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={25}
                            outerRadius={35}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip />
                    </PieChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
}
