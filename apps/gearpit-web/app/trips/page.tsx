"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { MapPin, Calendar, ArrowRight, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { tripApi, Trip } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TripFormDialog } from "@/components/trip/trip-form-dialog";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    try {
      const data = await tripApi.list();
      setTrips(data || []);
    } catch (error) {
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrips(); }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await tripApi.delete(id);
      toast.success("Trip plan deleted");
      fetchTrips();
    } catch (error) {
      toast.error("Failed to delete trip");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-50">Trip Plans</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Manage your expeditions and packing lists.</p>
          </div>
          <TripFormDialog onSuccess={fetchTrips} />
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Loading plans...</div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-lg border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">No trips planned yet</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">Start by creating a new packing plan.</p>
            <TripFormDialog onSuccess={fetchTrips} />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <Link href={`/trips/${trip.id}`} key={trip.id} className="block group">
                <Card className="h-full transition-all hover:shadow-md hover:border-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-600">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="mb-2 dark:border-zinc-700 dark:text-zinc-300">
                        {(trip.items?.length || 0) === 0 ? "Empty List" : `${trip.items?.length || 0} items`}
                      </Badge>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 -mr-2 -mt-2 text-zinc-400 hover:text-red-500"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Plan?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete the trip "{trip.name}" and its packing list. Items will remain in inventory.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-500" onClick={(e) => handleDelete(e, trip.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <CardTitle className="text-xl group-hover:text-blue-600 transition-colors dark:text-zinc-50 dark:group-hover:text-blue-400">
                      {trip.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-zinc-400" />
                      <span>{format(parseISO(trip.startDate), "MMM d")} - {format(parseISO(trip.endDate), "MMM d, yyyy")}</span>
                    </div>
                    {trip.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-zinc-400" />
                        <span>{trip.location}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2 border-t bg-zinc-50/50 dark:bg-zinc-900/50 dark:border-zinc-800 rounded-b-xl group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/20 transition-colors">
                    <div className="w-full flex justify-between items-center text-sm font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      <span>View Packing List</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}