"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { MapPin, Calendar, Trash2, Pencil, Package } from "lucide-react";
import { toast } from "sonner";

import { tripApi, Trip } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TripFormDialog } from "@/components/trip/trip-form-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
      setLoading(false);
    } catch {
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
      setLoading(false);
    } catch {
      toast.error("Failed to delete trip");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-muted/30 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Trip Plans</h1>
            <p className="text-muted-foreground">Manage your expeditions and packing lists.</p>
          </div>
          <TripFormDialog onSuccess={fetchTrips} />
        </div>

        <div className="rounded-md border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[30%]">Trip Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : trips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No trips planned yet. Click &quot;New Trip Plan&quot; to start.
                  </TableCell>
                </TableRow>
              ) : (
                trips.map((trip) => (
                  <TableRow
                    key={trip.id}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    <TableCell className="font-medium text-base text-foreground">
                      <Link
                        href={`/trips/${trip.id}`}
                        className="block w-full hover:underline decoration-dotted underline-offset-4"
                      >
                        {trip.name}
                      </Link>
                      {trip.description && <div className="text-xs text-muted-foreground truncate max-w-[200px]">{trip.description}</div>}
                    </TableCell>
                    <TableCell className="dark:text-zinc-300">
                      {trip.location && <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {trip.location}</div>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {format(parseISO(trip.startDate), "yyyy/MM/dd")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-muted-foreground">
                        <Package className="h-3 w-3 mr-1" /> {trip.tripItems?.length || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <TripFormDialog
                          tripToEdit={trip}
                          onSuccess={fetchTrips}
                          trigger={
                            <Button variant="ghost" size="icon" className="hover:bg-zinc-100 dark:hover:bg-zinc-800">
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          }
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20">
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete &quot;{trip.name}&quot;?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure? This will delete the trip plan. Items in your inventory remain safe.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={(e) => handleDelete(e, trip.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div >
  );
}