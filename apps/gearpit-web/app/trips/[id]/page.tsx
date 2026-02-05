"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from "recharts";
import { MapPin, Calendar, ArrowLeft, Package, AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { tripApi, Trip } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddGearToTripDialog } from "@/components/trip/add-gear-to-trip-dialog";
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
      toast.success("Item removed from trip");
      fetchTrip();
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const stats = useMemo(() => {
    if (!trip || !trip.items) return null;
    
    const totalWeight = trip.items.reduce((sum, item) => sum + item.weightGram, 0);
    const totalItems = trip.items.length;
    
    const categoryMap = new Map<string, number>();
    trip.items.forEach(item => {
      const cat = item.properties?.category || "Uncategorized";
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + item.weightGram);
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
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 px-8 py-6 mb-8 transition-colors">
        <div className="max-w-7xl mx-auto">
          <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400" onClick={() => router.push('/trips')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Plans
          </Button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">{trip.name}</h1>
              <div className="flex flex-wrap gap-4 text-zinc-500 dark:text-zinc-400 text-sm">
                <div className="flex items-center"><Calendar className="mr-1 h-4 w-4" /> {format(parseISO(trip.startDate), "yyyy/MM/dd")} - {format(parseISO(trip.endDate), "yyyy/MM/dd")}</div>
                {trip.location && <div className="flex items-center"><MapPin className="mr-1 h-4 w-4" /> {trip.location}</div>}
              </div>
              {trip.description && <p className="mt-4 text-zinc-600 dark:text-zinc-400 max-w-2xl">{trip.description}</p>}
            </div>
            
            <div className="flex gap-2">
              <AddGearToTripDialog tripId={trip.id} currentItems={trip.items || []} onSuccess={fetchTrip} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Dashboard / Stats */}
        <div className="space-y-6 lg:col-span-1">
          {/* Summary Card */}
          <Card className="bg-zinc-900 dark:bg-black text-white border-zinc-800 dark:border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-400 text-sm font-medium">Pack Weight</CardTitle>
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

          {/* Chart */}
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
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

           {/* Warnings */}
           {stats && stats.totalWeight === 0 && (
             <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50">
               <CardContent className="pt-6 flex flex-col items-center text-center text-amber-800 dark:text-amber-500">
                 <AlertTriangle className="h-8 w-8 mb-2 opacity-50" />
                 <p className="font-medium">Pack is empty</p>
                 <p className="text-sm opacity-80 mt-1">Start adding gears to see analytics.</p>
               </CardContent>
             </Card>
           )}
        </div>

        {/* Right Column: Packing List */}
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
                  <TableHead className="w-[50%]">Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Weight</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trip.items && trip.items.length > 0 ? (
                  trip.items.map((item) => (
                    <TableRow key={item.id} className="group dark:border-zinc-800">
                      <TableCell className="font-medium">
                        <EditGearDialog 
                          item={item} 
                          trigger={
                            <div className="cursor-pointer hover:underline decoration-dotted underline-offset-4 flex items-center gap-2 dark:text-zinc-200">
                              {item.name}
                              <span className="text-xs text-muted-foreground font-normal">{item.properties?.brand}</span>
                            </div>
                          } 
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal text-xs dark:bg-zinc-800 dark:text-zinc-300">{item.properties?.category || "Other"}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono dark:text-zinc-300">{item.weightGram}g</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      No items in this trip yet. <br/>
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