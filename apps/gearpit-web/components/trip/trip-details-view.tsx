"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { tripApi, gearApi, Trip, WeightType } from "@/lib/api";
import { categorizeTripItems, calculateTripStats } from "@/lib/utils/trip-utils";
import { TripHeader } from "./trip-header";
import { TripStats } from "./trip-stats";
import { GearCategoryCard } from "./gear-category-card";
import { AddGearToTripDialog } from "@/components/trip/add-gear-to-trip-dialog";
import { AddLoadoutToTripDialog } from "@/components/trip/add-loadout-to-trip-dialog";
import { Shirt, Backpack, Zap, Anchor } from "lucide-react";

interface TripDetailsViewProps {
    initialTrip: Trip;
}

export function TripDetailsView({ initialTrip }: TripDetailsViewProps) {
    const [trip, setTrip] = useState<Trip>(initialTrip);
    const [draggingItemId, setDraggingItemId] = useState<string | null>(null);

    // Refresh trip data from server (used after mutations)
    const refreshTrip = useCallback(async () => {
        try {
            const data = await tripApi.get(trip.id);
            setTrip(data);
        } catch {
            toast.error("Failed to refresh trip details");
        }
    }, [trip.id]);

    const handleRemoveItem = async (itemId: string) => {
        try {
            // Optimistic update
            setTrip(prev => ({
                ...prev,
                tripItems: prev.tripItems?.filter(ti => ti.itemId !== itemId)
            }));
            await tripApi.removeItems(trip.id, [itemId]);
            toast.success("Item removed");
            refreshTrip();
        } catch {
            toast.error("Failed to remove item");
            refreshTrip(); // Revert
        }
    };

    const handleUpdateQuantity = async (itemId: string, currentQty: number, change: number) => {
        const newQty = currentQty + change;
        if (newQty < 1) return;

        try {
            // Optimistic update
            setTrip(prev => ({
                ...prev,
                tripItems: prev.tripItems?.map(ti =>
                    ti.itemId === itemId ? { ...ti, quantity: newQty } : ti
                )
            }));

            await tripApi.updateItemQuantity(trip.id, itemId, newQty);
            refreshTrip();
        } catch {
            toast.error("Failed to update quantity");
            refreshTrip(); // Revert
        }
    };

    const handleCompleteTrip = async () => {
        if (!confirm("Are you sure you want to complete this trip? This will increase the usage count for all packed items.")) return;
        try {
            const res = await fetch(`/api/v1/trips/${trip.id}/complete`, { method: 'POST' });
            if (!res.ok) throw new Error("Failed to complete trip");
            toast.success("Trip completed! Gear usage updated.");
            refreshTrip();
        } catch {
            toast.error("Failed to complete trip");
        }
    };

    const handleDragItem = async (itemId: string, newType: WeightType) => {
        // Find the trip item to get the gear item id
        const tri = trip.tripItems?.find(ti => ti.itemId === itemId);
        if (!tri) return;

        try {
            // Optimistic update of UI categorization
            setTrip(prev => ({
                ...prev,
                tripItems: prev.tripItems?.map(ti =>
                    ti.itemId === itemId ? { ...ti, item: { ...ti.item, weightType: newType } } : ti
                )
            }));

            // Update on backend (updates the item's global weightType)
            await gearApi.updateItem(tri.item.id, { weightType: newType });
            toast.success(`Moved to ${newType}`);
            refreshTrip();
        } catch {
            toast.error("Failed to move item");
            refreshTrip();
        }
    };

    const stats = useMemo(() => calculateTripStats(trip.tripItems || []), [trip.tripItems]);
    const categories = useMemo(() => categorizeTripItems(trip.tripItems || []), [trip.tripItems]);

    return (
        <div className="min-h-screen bg-muted/30 pb-20">
            <TripHeader trip={trip} onComplete={handleCompleteTrip} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* KPIS & Stats */}
                <section>
                    <TripStats stats={stats} />
                </section>

                {/* Action Bar */}
                <div className="flex justify-end gap-2">
                    <AddLoadoutToTripDialog tripId={trip.id} onSuccess={refreshTrip} />
                    <AddGearToTripDialog
                        tripId={trip.id}
                        currentItems={trip.tripItems?.map(ti => ti.item) || []}
                        onSuccess={refreshTrip}
                    />
                </div>

                {/* Gear Categories Grid - 4 Columns Layout */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">

                    {/* 1. Long Gear / Skis (Far Left) */}
                    <div className="lg:col-span-1 h-full">
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (draggingItemId) {
                                    handleDragItem(draggingItemId, 'long');
                                    setDraggingItemId(null);
                                }
                            }}
                            className="h-full"
                        >
                            <GearCategoryCard
                                title="Long Gear"
                                items={categories.long_gear}
                                totalWeight={categories.long_gear.reduce((acc, ti) => acc + (ti.item.weightGram * ti.quantity), 0)}
                                icon={<Anchor className="h-4 w-4" />}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemoveItem={handleRemoveItem}
                                onDragStart={(id) => setDraggingItemId(id)}
                            />
                        </div>
                    </div>

                    {/* 2. Wearable System */}
                    <div className="lg:col-span-1 h-full">
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (draggingItemId) {
                                    handleDragItem(draggingItemId, 'worn');
                                    setDraggingItemId(null);
                                }
                            }}
                            className="h-full"
                        >
                            <GearCategoryCard
                                title="Wearable System"
                                items={categories.wearable}
                                totalWeight={categories.wearable.reduce((acc, ti) => acc + (ti.item.weightGram * ti.quantity), 0)}
                                icon={<Shirt className="h-4 w-4" />}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemoveItem={handleRemoveItem}
                                variant="featured"
                                onDragStart={(id) => setDraggingItemId(id)}
                            />
                        </div>
                    </div>

                    {/* 3. Backpack & Contents */}
                    <div className="lg:col-span-1 h-full">
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (draggingItemId) {
                                    handleDragItem(draggingItemId, 'base');
                                    setDraggingItemId(null);
                                }
                            }}
                            className="h-full"
                        >
                            <GearCategoryCard
                                title="Backpack & Contents"
                                items={categories.pack}
                                totalWeight={categories.pack.reduce((acc, ti) => acc + (ti.item.weightGram * ti.quantity), 0)}
                                icon={<Backpack className="h-4 w-4" />}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemoveItem={handleRemoveItem}
                                onDragStart={(id) => setDraggingItemId(id)}
                            />
                        </div>
                    </div>

                    {/* 4. Essentials & Accessories */}
                    <div className="lg:col-span-1 h-full">
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (draggingItemId) {
                                    handleDragItem(draggingItemId, 'accessory');
                                    setDraggingItemId(null);
                                }
                            }}
                            className="h-full"
                        >
                            <GearCategoryCard
                                title="Essentials & Accessories"
                                items={categories.essentials}
                                totalWeight={categories.essentials.reduce((acc, ti) => acc + (ti.item.weightGram * ti.quantity), 0)}
                                icon={<Zap className="h-4 w-4" />}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemoveItem={handleRemoveItem}
                                onDragStart={(id) => setDraggingItemId(id)}
                            />
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}
