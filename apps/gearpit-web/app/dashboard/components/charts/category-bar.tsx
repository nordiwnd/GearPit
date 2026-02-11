"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardStats } from "@/lib/api";

interface CategoryBarProps {
    stats: DashboardStats;
}

export function CategoryBar({ stats }: CategoryBarProps) {
    if (stats.categoryStats.length === 0) {
        return (
            <Card className="col-span-4 lg:col-span-2 h-[400px] flex items-center justify-center text-muted-foreground dark:bg-zinc-900/50 dark:border-zinc-800/50">
                No category data available.
            </Card>
        )
    }

    return (
        <Card className="col-span-4 lg:col-span-2 dark:bg-zinc-900/50 dark:border-zinc-800/50">
            <CardHeader>
                <CardTitle>Item Count by Category</CardTitle>
                <CardDescription>Number of items in each category.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.categoryStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                        <XAxis
                            dataKey="category"
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            tickFormatter={(val) => val || "Uncategorized"}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            allowDecimals={false}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--popover))',
                                borderColor: 'hsl(var(--border))',
                                color: 'hsl(var(--popover-foreground))',
                                borderRadius: 'var(--radius)',
                            }}
                            formatter={(value: number | undefined) => [`${value ?? 0} items`, 'Count']}
                            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold', marginBottom: '4px' }}
                            animationDuration={300}
                        />
                        <Bar
                            dataKey="count"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                            name="Items"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
