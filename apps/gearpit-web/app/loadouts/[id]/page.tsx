"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Scale, Package, Battery, Shirt } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { loadoutApi, Loadout } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function LoadoutDetailPage() {
    const params = useParams();
    const [loadout, setLoadout] = useState<Loadout | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLoadout = async () => {
            try {
                if (params.id) {
                    const data = await loadoutApi.get(params.id as string);
                    setLoadout(data);
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load loadout details");
            } finally {
                setLoading(false);
            }
        };
        fetchLoadout();
    }, [params.id]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!loadout) {
        return <div className="flex h-screen items-center justify-center">Loadout not found</div>;
    }

    const formatWeight = (grams: number) => (grams / 1000).toFixed(2);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-8 transition-colors">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col gap-4">
                    <Link href="/loadouts">
                        <Button variant="ghost" className="w-fit pl-0 hover:bg-transparent hover:text-zinc-600 dark:hover:text-zinc-300">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Loadouts
                        </Button>
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-zinc-500 uppercase tracking-wider text-[10px]">
                                    {loadout.activityType}
                                </Badge>
                                <div className="text-xs text-zinc-400 font-mono">ID: {loadout.id.slice(0, 8)}</div>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                                {loadout.name}
                            </h1>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Actions like Edit/Delete could go here */}
                        </div>
                    </div>
                </div>

                {/* Analytics Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Base Weight (Hero Metric) */}
                    <Card className="col-span-2 md:col-span-1 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                <Scale className="h-3 w-3" /> Base Weight
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                    {formatWeight(loadout.baseWeightGram)}
                                </span>
                                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">kg</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-1">Pack + Gear (No food/water/worn)</p>
                        </CardContent>
                    </Card>

                    {/* Total Weight */}
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                <Package className="h-3 w-3" /> Total
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-semibold text-zinc-700 dark:text-zinc-200">
                                    {formatWeight(loadout.totalWeightGram)}
                                </span>
                                <span className="text-sm font-medium text-zinc-500">kg</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-1">Skin-out weight</p>
                        </CardContent>
                    </Card>

                    {/* Consumable */}
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                <Battery className="h-3 w-3" /> Consumable
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-semibold text-zinc-700 dark:text-zinc-200">
                                    {formatWeight(loadout.consumableWeightGram)}
                                </span>
                                <span className="text-sm font-medium text-zinc-500">kg</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-1">Food, Water, Fuel</p>
                        </CardContent>
                    </Card>

                    {/* Worn */}
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                <Shirt className="h-3 w-3" /> Worn
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-semibold text-zinc-700 dark:text-zinc-200">
                                    {formatWeight(loadout.wornWeightGram)}
                                </span>
                                <span className="text-sm font-medium text-zinc-500">kg</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-1">Clothes, Shoes, Watch</p>
                        </CardContent>
                    </Card>
                </div>

                <Separator className="dark:bg-zinc-800" />

                {/* Packing List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold dark:text-zinc-100 flex items-center gap-2">
                        <Package className="h-5 w-5" /> Pack Contents ({loadout.items?.length || 0})
                    </h2>

                    <div className="rounded-lg border bg-white dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
                        <ScrollArea className="h-[500px]">
                            <div className="divide-y dark:divide-zinc-800">
                                {loadout.items?.map((item) => (
                                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <div className="flex-1">
                                            <div className="font-medium text-zinc-900 dark:text-zinc-100">{item.name}</div>
                                            <div className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-1">
                                                {item.properties?.brand && <span>{item.properties.brand}</span>}
                                                {item.weightType && item.weightType !== 'base' && (
                                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal tracking-wide capitalize">
                                                        {item.weightType}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
                                                {item.weightGram} <span className="text-xs text-zinc-500">g</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!loadout.items || loadout.items.length === 0) && (
                                    <div className="p-8 text-center text-zinc-500">No items in this loadout.</div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </div>
    );
}
