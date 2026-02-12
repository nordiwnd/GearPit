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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Wearable Weight */}
            <Card className="bg-muted/50 border-none shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Total Wear Weight
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold">{(stats.worn / 1000).toFixed(1)}</span>
                        <span className="text-lg text-muted-foreground mb-1">kg</span>
                    </div>
                </CardContent>
            </Card>

            {/* Pack Weight & Breakdown */}
            <Card className="col-span-1 md:col-span-1 lg:col-span-1 border-none shadow-sm relative overflow-hidden">
                <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Total Pack Weight
                    </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold">{(stats.total / 1000).toFixed(1)}</span>
                        <span className="text-lg text-muted-foreground mb-1">kg</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        Base: {(stats.base / 1000).toFixed(1)}kg | Consumable: {(stats.consumable / 1000).toFixed(1)}kg
                    </div>
                </CardContent>
                {/* Decorative Element */}
                <div className="absolute right-[-20px] top-[-20px] opacity-5 pointer-events-none">
                    <Backpack size={120} />
                </div>
            </Card>

            {/* Visual Weight Breakdown */}
            <Card className="border-none shadow-sm flex flex-col justify-center">
                <CardContent className="p-0 h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={45}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                formatter={(value: number | string | undefined) => `${Number(value || 0) / 1000} kg`}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--popover))',
                                    borderColor: 'hsl(var(--border))',
                                    color: 'hsl(var(--popover-foreground))',
                                    borderRadius: 'var(--radius)',
                                    fontSize: '12px'
                                }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
