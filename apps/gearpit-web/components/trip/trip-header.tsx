"use client";

import { Button } from "@/components/ui/button";
import { Trip } from "@/lib/api";
import { Calendar, MapPin, User, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";

interface TripHeaderProps {
    trip: Trip;
    onComplete: () => void;
}

export function TripHeader({ trip, onComplete }: TripHeaderProps) {
    const router = useRouter();

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
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2">
                        <div>
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
                    </div>
                </div>
            </div>
        </div>
    );
}
