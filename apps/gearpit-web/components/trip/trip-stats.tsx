"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeightStats } from "@/lib/utils/trip-utils";
import { Backpack } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

interface TripStatsProps {
    stats: WeightStats;
}

const COLORS = ['#3b82f6', '#94a3b8']; // Blue for Base, Gray for Consumable

export function TripStats({ stats }: TripStatsProps) {
    const pieData = [
        { name: 'Base Weight', value: stats.base },
        { name: 'Consumables', value: stats.consumable },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Wearable Weight */}
            <Card className="bg-muted/50 border-none shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Total Wear Weight
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-1">
                        <span className="text-4xl font-bold">{(stats.worn / 1000).toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground mb-1">kg</span>
                    </div>
                </CardContent>
            </Card>

            {/* Pack Weight */}
            <Card className="bg-muted/50 border-none shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Total Pack Weight
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-1">
                        <span className="text-4xl font-bold">{(stats.total / 1000).toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground mb-1">kg</span>
                        <span className="text-xs text-muted-foreground mb-1 ml-2">
                            Base: {(stats.base / 1000).toFixed(1)}kg | Consumable: {(stats.consumable / 1000).toFixed(1)}kg
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Visual Weight Breakdown - Pie Chart */}
            <Card className="bg-black/20 border-none shadow-sm flex flex-col justify-center items-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <PieChart width={200} height={100}>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={45}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                            startAngle={180}
                            endAngle={0}
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Legend
                            verticalAlign="middle"
                            align="right"
                            layout="vertical"
                            iconSize={8}
                            formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                        />
                    </PieChart>
                </div>
            </Card>
        </div>
    );
}
