"use client";

import { Package, Scale, Layers, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/lib/api";

interface OverviewCardsProps {
    stats: DashboardStats;
}

export function OverviewCards({ stats }: OverviewCardsProps) {
    const cards = [
        {
            title: "Total Gears",
            icon: Package,
            value: stats.totalItems,
            sub: "Items in inventory",
        },
        {
            title: "Total Weight",
            icon: Scale,
            value: `${(stats.totalWeight / 1000).toFixed(2)} kg`,
            sub: "Combined weight",
        },
        {
            title: "Loadouts",
            icon: Layers,
            value: stats.totalLoadouts,
            sub: "Created packing lists",
        },
        {
            title: "Total Cost",
            icon: IndianRupee,
            value: `¥${stats.totalCost.toLocaleString()}`,
            sub: "Maintenance expenses",
        },
        {
            title: "Long Gear Weight",
            icon: Scale,
            value: `${(stats.longWeight / 1000).toFixed(2)} kg`,
            sub: "Skis, Poles, etc.",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((item, i) => (
                <Card
                    key={i}
                    className="dark:bg-zinc-900/50 dark:border-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors cursor-default"
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {item.title}
                        </CardTitle>
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold dark:text-zinc-100">
                            {item.value}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
