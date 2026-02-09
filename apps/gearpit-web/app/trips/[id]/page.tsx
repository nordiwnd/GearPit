"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from "recharts";
import { MapPin, Calendar, ArrowLeft, Package, Trash2, Plus, Minus, User } from "lucide-react";
import { toast } from "sonner";

import { tripApi, Trip } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddGearToTripDialog } from "@/components/trip/add-gear-to-trip-dialog";
import { AddLoadoutToTripDialog } from "@/components/trip/add-loadout-to-trip-dialog";
import { EditGearDialog } from "@/components/inventory/edit-gear-dialog";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff8042', '#a4de6c'];

export default function TripDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTrip = async () => {
    try {
      const data = await tripApi.get(id);
      setTrip(data);
    } catch (error) {
      toast.error("Failed to load trip details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrip(); }, [id]);

  const handleRemoveItem = async (itemId: string) => {
    try {
      await tripApi.removeItems(id, [itemId]);
      toast.success("Item removed");
      fetchTrip();
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleQuantityChange = async (itemId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    try {
      await tripApi.updateItemQuantity(id, itemId, newQty);
      fetchTrip();
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleCompleteTrip = async () => {
    if (!confirm("Are you sure you want to complete this trip? This will increase the usage count for all packed items.")) return;
    try {
      const res = await fetch(`/api/v1/trips/${id}/complete`, { method: 'POST' });
      if (!res.ok) throw new Error("Failed to complete trip");
      toast.success("Trip completed! Gear usage updated.");
      fetchTrip();
    } catch (error) {
      toast.error("Failed to complete trip");
    }
  };

  const stats = useMemo(() => {
    if (!trip || !trip.tripItems) return null;

    const totalWeight = trip.tripItems.reduce((sum, ti) => sum + (ti.item.weightGram * ti.quantity), 0);
    const totalItems = trip.tripItems.reduce((sum, ti) => sum + ti.quantity, 0);

    const categoryMap = new Map<string, number>();
    trip.tripItems.forEach(ti => {
      const cat = ti.item.properties?.category || "Uncategorized";
      const weight = ti.item.weightGram * ti.quantity;
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + weight);
    });

    const pieData = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { totalWeight, totalItems, pieData };
  }, [trip]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin text-zinc-500">Loading...</div></div>;
  if (!trip) return <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">Trip not found</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20 transition-colors">
      <div className="bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 px-8 py-6 mb-8 transition-colors">
        <div className="max-w-7xl mx-auto">
          <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400" onClick={() => router.push('/trips')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Plans
          </Button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">{trip.name}</h1>
              <div className="flex flex-wrap gap-4 text-zinc-500 dark:text-zinc-400 text-sm mb-2">
                <div className="flex items-center"><Calendar className="mr-1 h-4 w-4" /> {format(parseISO(trip.startDate), "yyyy/MM/dd")} - {format(parseISO(trip.endDate), "yyyy/MM/dd")}</div>
                {trip.location && <div className="flex items-center"><MapPin className="mr-1 h-4 w-4" /> {trip.location}</div>}
              </div>

              {trip.userProfile && (
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full w-fit">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{trip.userProfile.name}</span>
                  <span className="text-zinc-400">|</span>
                  <span>{trip.userProfile.heightCm}cm / {trip.userProfile.weightKg}kg</span>
                </div>
              )}

              {trip.description && <p className="mt-4 text-zinc-600 dark:text-zinc-400 max-w-2xl">{trip.description}</p>}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCompleteTrip}
                className="dark:bg-green-600 dark:hover:bg-green-700 bg-green-600 hover:bg-green-700 text-white"
                disabled={trip.status === 'completed'}
              >
                {trip.status === 'completed' ? "Completed" : "Complete Trip"}
              </Button>
              <AddLoadoutToTripDialog tripId={trip.id} onSuccess={fetchTrip} />
              <AddGearToTripDialog
                tripId={trip.id}
                currentItems={trip.tripItems?.map(ti => ti.item) || []}
                onSuccess={fetchTrip}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6 lg:col-span-1">
          <Card className="bg-zinc-900 dark:bg-black text-white border-zinc-800 dark:border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-400 text-sm font-medium">Total Pack Weight</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold font-mono">
                {stats ? (stats.totalWeight / 1000).toFixed(2) : "0.00"} <span className="text-lg text-zinc-500">kg</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
                <Package className="h-4 w-4" /> {stats?.totalItems} items packed
              </div>
            </CardContent>
          </Card>

          {stats && stats.totalWeight > 0 && (
            <Card className="dark:bg-zinc-900 dark:border-zinc-800">
              <CardHeader><CardTitle className="text-base dark:text-zinc-100">Weight Analysis</CardTitle></CardHeader>
              <CardContent className="h-[250px] -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {stats.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: any) => `${value}g`}
                      contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 dark:text-zinc-50">
              <Package className="h-5 w-5" /> Packing List
            </h2>
          </div>

          <Card className="dark:bg-zinc-900 dark:border-zinc-800">
            <Table>
              <TableHeader>
                <TableRow className="dark:border-zinc-800">
                  <TableHead className="w-[40%]">Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Weight (Total)</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trip.tripItems && trip.tripItems.length > 0 ? (
                  trip.tripItems.map((ti) => (
                    <TableRow key={ti.itemId} className="group dark:border-zinc-800">
                      <TableCell className="font-medium">
                        <EditGearDialog
                          item={ti.item}
                          trigger={
                            <div className="cursor-pointer hover:underline decoration-dotted underline-offset-4 flex items-center gap-2 dark:text-zinc-200">
                              {ti.item.name}
                              <span className="text-xs text-muted-foreground font-normal">{ti.item.properties?.brand}</span>
                            </div>
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal text-xs dark:bg-zinc-800 dark:text-zinc-300">{ti.item.properties?.category || "Other"}</Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(ti.itemId, ti.quantity, -1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-mono">{ti.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(ti.itemId, ti.quantity, 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-mono dark:text-zinc-300">
                        {ti.item.weightGram * ti.quantity}g
                        {ti.quantity > 1 && <div className="text-[10px] text-muted-foreground">({ti.item.weightGram}g ea)</div>}
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveItem(ti.itemId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No items in this trip yet. <br />
                      Click "Add Gear" to build your packing list.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}