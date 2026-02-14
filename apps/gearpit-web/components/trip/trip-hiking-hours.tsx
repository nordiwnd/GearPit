"use client";

import { useState } from "react";
import { Minus, Plus, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tripApi, Trip } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TripHikingHoursProps {
    trip: Trip;
    onSuccess?: () => void;
}

export function TripHikingHours({ trip, onSuccess }: TripHikingHoursProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [hours, setHours] = useState(trip.plannedHikingHours || 0);

    const handleUpdate = async (newHours: number) => {
        if (newHours < 0) return;
        setLoading(true);
        // Optimistic UI
        setHours(newHours);

        try {
            await tripApi.update(trip.id, {
                // We need to send other required fields or backend validation might fail if they are checked.
                // However, tripApi.update maps to PUT, which usually replaces.
                // But the Go struct usually allows partial updates via GORM if tailored, or we might need to send everything.
                // Looking at `TripHandler.UpdateTrip`, it binds `TripRequest`. If we send only `plannedHikingHours`, others might zero out if not careful
                // OR if the Update implementation fetches -> merges -> saves.
                // Let's verify `TripHandler` logic mentally... 
                // Ah, the frontend `tripApi.update` takes `CreateTripPayload`. We must likely provide full payload or at least what validates.
                // To be safe and quick, we should use the existing trip data.
                name: trip.name,
                description: trip.description,
                location: trip.location,
                startDate: trip.startDate,
                endDate: trip.endDate,
                userProfileId: trip.userProfileId,
                plannedHikingHours: newHours
            });
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update hours");
            setHours(trip.plannedHikingHours || 0); // Revert
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2 bg-muted/50 px-2.5 py-1 rounded-md border border-transparent hover:border-border transition-colors group">
            <Timer className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium min-w-[3ch] text-center">{hours.toFixed(1)}h</span>

            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => handleUpdate(hours - 0.5)}
                    disabled={loading || hours <= 0}
                >
                    <Minus className="h-3 w-3" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => handleUpdate(hours + 0.5)}
                    disabled={loading}
                >
                    <Plus className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}
