"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { toast } from "sonner";
import { Scale, Package, Trash2, Pencil } from "lucide-react";

import { loadoutApi, Loadout } from "@/lib/api";
import { LoadoutFormDialog } from "@/components/loadout/loadout-form-dialog";
import { EditGearDialog } from "@/components/inventory/edit-gear-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function LoadoutPage() {
  const [loadouts, setLoadouts] = useState<Loadout[]>([]);
  const [selectedLoadout, setSelectedLoadout] = useState<Loadout | null>(null);

  const fetchLoadouts = useCallback(async () => {
    try {
      const data = await loadoutApi.list();
      setLoadouts(data || []);
    } catch {
      toast.error("Failed to load loadouts from server");
    }
  }, []);

  useEffect(() => { fetchLoadouts(); }, [fetchLoadouts]);

  const executeDelete = async (id: string) => {
    try {
      await loadoutApi.delete(id);
      toast.success("Loadout deleted successfully");
      setSelectedLoadout(null);
      fetchLoadouts();
    } catch {
      toast.error("Failed to delete loadout");
    }
  };

  return (
    // ダークモード背景を統一
    <div className="min-h-screen p-8 bg-muted/30 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Loadouts</h1>
            <p className="text-muted-foreground">Plan your packing lists and optimize weight.</p>
          </div>
          <LoadoutFormDialog onSuccess={fetchLoadouts} />
        </div>

        <div className="rounded-md border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">Loadout Name</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Item Count</TableHead>
                <TableHead className="text-right">Total Weight (kg)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No loadouts created yet. Click &quot;Create Loadout&quot; to start.
                  </TableCell>
                </TableRow>
              ) : (
                loadouts.map((loadout) => (
                  <TableRow
                    key={loadout.id}
                    className="group hover:bg-accent/50 transition-colors"
                  >
                    <TableCell className="font-medium text-base text-foreground">
                      <Link href={`/loadouts/${loadout.id}`} className="block w-full h-full hover:underline decoration-zinc-400 underline-offset-4">
                        {loadout.name}
                      </Link>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{loadout.activityType}</Badge></TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Package className="h-4 w-4" /> {loadout.items?.length || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium text-foreground">
                      {(loadout.totalWeightGram / 1000).toFixed(2)} kg
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <LoadoutFormDialog
                          loadoutToEdit={loadout}
                          onSuccess={fetchLoadouts}
                          trigger={
                            <Button variant="ghost" size="icon" className="hover:bg-accent">
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
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete &quot;{loadout.name}&quot;?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this loadout?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => executeDelete(loadout.id)}>
                                Delete Loadout
                              </AlertDialogAction>
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

        <Sheet open={!!selectedLoadout} onOpenChange={(open) => !open && setSelectedLoadout(null)}>
          <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full bg-background border-l">
            <SheetHeader className="mb-6">
              <Badge variant="outline" className="w-fit mb-2 dark:border-zinc-700 dark:text-zinc-400">{selectedLoadout?.activityType}</Badge>
              <SheetTitle className="text-2xl text-foreground">{selectedLoadout?.name}</SheetTitle>
              <SheetDescription className="flex items-center gap-1 font-mono text-base text-foreground font-medium">
                <Scale className="h-4 w-4" /> Total Pack Weight: {(Number(selectedLoadout?.totalWeightGram) / 1000).toFixed(2)} kg
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
              {/* Analytics Cards */}
              <div className="grid grid-cols-2 gap-2">
                <Card className="bg-card">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Base Weight</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="text-2xl font-bold text-foreground">
                      {((selectedLoadout?.baseWeightGram || 0) / 1000).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">kg</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="text-2xl font-bold text-foreground">
                      {((selectedLoadout?.totalWeightGram || 0) / 1000).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">kg</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Consumable</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="text-lg font-semibold text-foreground">
                      {((selectedLoadout?.consumableWeightGram || 0) / 1000).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">kg</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Worn</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="text-lg font-semibold text-foreground">
                      {((selectedLoadout?.wornWeightGram || 0) / 1000).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">kg</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <h3 className="font-semibold text-lg flex items-center text-foreground mt-4">
                <Package className="h-5 w-5 mr-2" /> Packed Gears ({selectedLoadout?.items?.length || 0})
              </h3>
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-2 pb-8">
                  {selectedLoadout?.items?.map(item => (
                    <EditGearDialog
                      key={item.id}
                      item={item}
                      trigger={
                        <div className="flex justify-between items-center p-3 bg-card border rounded-md cursor-pointer hover:bg-accent transition-colors group">
                          <div>
                            <div className="font-medium text-sm text-foreground flex items-center gap-2">
                              {item.name}
                            </div>
                            <div className="text-xs text-muted-foreground">{item.properties?.brand || "-"}</div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="font-mono block mb-1">{item.weightGram}g</Badge>
                            {item.weightType && item.weightType !== 'base' && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1 dark:border-zinc-700 dark:text-zinc-400">
                                {item.weightType}
                              </Badge>
                            )}
                          </div>
                        </div>
                      }
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet >
      </div >
    </div >
  );
}