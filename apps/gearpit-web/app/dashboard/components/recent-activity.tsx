"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Package, Layers, ExternalLink } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { gearApi, loadoutApi, GearItem, Loadout } from "@/lib/api";

type ActivityItem = (GearItem | Loadout) & { type: 'gear' | 'loadout' };

export function RecentActivity() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [gears, loadouts] = await Promise.all([
                    gearApi.listItems(),
                    loadoutApi.list()
                ]);

                const gearItems = gears.map(g => ({ ...g, type: 'gear' as const }));
                const loadoutItems = loadouts.map(l => ({ ...l, type: 'loadout' as const }));

                const all = [...gearItems, ...loadoutItems].sort((a, b) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                ).slice(0, 10); // Top 10 recent

                setActivities(all);
            } catch (e) {
                console.error("Failed to load activity", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading activity...</div>;

    return (
        <Card className="col-span-4 lg:col-span-2 dark:bg-zinc-900/50 dark:border-zinc-800/50">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                    Latest updates to your inventory and loadouts.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[350px] pr-4">
                    <div className="space-y-4">
                        {activities.map((item) => (
                            <div key={`${item.type}-${item.id}`} className="flex items-start gap-4 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                                <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-700">
                                    <AvatarFallback className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500">
                                        {item.type === 'gear' ? <Package size={16} /> : <Layers size={16} />}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium leading-none">
                                            {item.name}
                                        </p>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <span className="capitalize">{item.type}</span>
                                        <span className="mx-1">•</span>
                                        <span>
                                            {item.type === 'gear'
                                                ? `${(item as GearItem).weightGram}g`
                                                : `${(item as Loadout).totalWeightGram}g`
                                            }
                                        </span>
                                    </div>
                                </div>
                                <Link href={item.type === 'gear' ? `/inventory?id=${item.id}` : `/loadouts/${item.id}`}>
                                    <ExternalLink size={14} className="text-muted-foreground hover:text-foreground transition-colors" />
                                </Link>
                            </div>
                        ))}
                        {activities.length === 0 && (
                            <div className="text-center text-sm text-muted-foreground py-8">
                                No recent activity found.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
