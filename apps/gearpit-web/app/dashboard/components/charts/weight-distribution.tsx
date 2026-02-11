"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardStats } from "@/lib/api";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface WeightDistributionProps {
    stats: DashboardStats;
}

export function WeightDistribution({ stats }: WeightDistributionProps) {
    const pieData = stats.categoryStats
        .filter(c => c.totalWeight > 0)
        .map(c => ({ name: c.category || "Uncategorized", value: c.totalWeight }));

    if (pieData.length === 0) {
        return (
            <Card className="col-span-4 lg:col-span-2 h-[400px] flex items-center justify-center text-muted-foreground dark:bg-zinc-900/50 dark:border-zinc-800/50">
                No weight data available.
            </Card>
        )
    }

    return (
        <Card className="col-span-4 lg:col-span-2 dark:bg-zinc-900/50 dark:border-zinc-800/50">
            <CardHeader>
                <CardTitle>Weight Distribution</CardTitle>
                <CardDescription>Breakdown of gear weight by category.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number | undefined) => `${value ?? 0}g`}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--popover))',
                                borderColor: 'hsl(var(--border))',
                                color: 'hsl(var(--popover-foreground))',
                                borderRadius: 'var(--radius)',
                            }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            wrapperStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
