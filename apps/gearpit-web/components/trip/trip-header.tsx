"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Trip, tripApi } from "@/lib/api";
import { Calendar, MapPin, User, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { TripFormDialog } from "./trip-form-dialog";
import { TripHydrationChart } from "./trip-hydration-chart";
import { TripWaterInput } from "./trip-water-input";
import { TripHikingHours } from "./trip-hiking-hours";
import { calculateTripStats } from "@/lib/utils/trip-utils";

interface TripHeaderProps {
    trip: Trip;
    onComplete: () => void;
}

export function TripHeader({ trip, onComplete }: TripHeaderProps) {
    const router = useRouter();
    const [hikingHours, setHikingHours] = useState(trip.plannedHikingHours || 0);
    const [updatingBytes, setUpdatingBytes] = useState(false);

    // Sync local state when prop changes (e.g. after refresh)
    useEffect(() => {
        setHikingHours(trip.plannedHikingHours || 0);
    }, [trip.plannedHikingHours]);

    const handleHoursUpdate = async (newHours: number) => {
        if (newHours < 0) return;
        setHikingHours(newHours); // Optimistic update
        setUpdatingBytes(true);

        try {
            await tripApi.update(trip.id, {
                name: trip.name,
                description: trip.description,
                location: trip.location,
                startDate: trip.startDate,
                endDate: trip.endDate,
                userProfileId: trip.userProfileId,
                plannedHikingHours: newHours
            });
            router.refresh(); // Refresh to ensure data consistency
        } catch (error) {
            console.error(error);
            toast.error("Failed to update hours");
            setHikingHours(trip.plannedHikingHours || 0); // Revert
        } finally {
            setUpdatingBytes(false);
        }
    };

    // Dynamic Calculation
    const stats = useMemo(() => calculateTripStats(trip.tripItems || []), [trip.tripItems]);
    const totalPackWeight = stats.total;

    const dynamicStats = useMemo(() => {
        const bodyWeightKg = trip.userProfile?.weightKg || 0;
        const packWeightKg = totalPackWeight / 1000;
        const totalWeightKg = bodyWeightKg + packWeightKg;

        // Formulas from backend (internal/domain/pit_logic.go)
        // Hydration: (Body + Pack) * 5 * Hours
        const hydration = Math.round(totalWeightKg * 5 * hikingHours);

        // Calories: 1.55 * (Body + Pack) * Hours
        const calories = Math.round(1.55 * totalWeightKg * hikingHours);

        return { hydration, calories };
    }, [trip.userProfile, totalPackWeight, hikingHours]);

    return (
        <div className="bg-background border-b sticky top-0 z-20 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col gap-4">
                    {/* Top Row: Back & Actions */}
                    <div className="flex justify-between items-center">
                        <Button variant="ghost" size="sm" onClick={() => router.push('/trips')} className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to Trips
                        </Button>
                        <div className="flex gap-2">
                            <TripFormDialog
                                tripToEdit={trip}
                                trigger={<Button variant="outline" size="sm">Edit Trip</Button>}
                            />
                            <Button
                                size="sm"
                                onClick={onComplete}
                                disabled={trip.status === 'completed'}
                                className={trip.status === 'completed' ? "bg-muted text-muted-foreground" : "bg-green-600 hover:bg-green-700 text-white border-none"}
                            >
                                {trip.status === 'completed' ? "Completed" : "Complete Trip"}
                            </Button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-2">
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">{trip.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{format(parseISO(trip.startDate), "MMM dd")} - {format(parseISO(trip.endDate), "MMM dd, yyyy")}</span>
                                </div>
                                {trip.location && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span>{trip.location}</span>
                                    </div>
                                )}
                                {trip.userProfile && (
                                    <div className="flex items-center gap-1.5 pl-2 border-l border-border">
                                        <User className="h-3.5 w-3.5" />
                                        <span>{trip.userProfile.name}</span>
                                        <span className="text-xs opacity-70">({trip.userProfile.heightCm}cm/{trip.userProfile.weightKg}kg)</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Hydration & Water Input Section */}
                        <div className="flex flex-col gap-2 w-full md:w-auto min-w-[320px]">
                            <div className="flex justify-end mb-1">
                                <TripHikingHours
                                    hours={hikingHours}
                                    onUpdate={handleHoursUpdate}
                                    loading={updatingBytes}
                                />
                            </div>
                            <TripHydrationChart
                                hydration={dynamicStats.hydration}
                                calories={dynamicStats.calories}
                            />
                            <TripWaterInput trip={trip} onSuccess={() => router.refresh()} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
