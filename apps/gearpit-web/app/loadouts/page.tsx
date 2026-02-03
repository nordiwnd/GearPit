"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Scale, Package, Trash2, Pencil, X } from "lucide-react";

import { CreateLoadoutDialog } from "@/components/loadout/create-loadout-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { loadoutApi, Loadout } from "@/lib/api"; 

export default function LoadoutPage() {
  const [loadouts, setLoadouts] = useState<Loadout[]>([]);
  const [selectedLoadout, setSelectedLoadout] = useState<Loadout | null>(null);
  const router = useRouter();

  const fetchLoadouts = async () => {
    try {
      const data = await loadoutApi.list();
      setLoadouts(data || []);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchLoadouts(); }, []);

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); // 行クリックイベントの発火を防ぐ
    if (!confirm(`Delete loadout "${name}"?`)) return;
    try {
      await loadoutApi.delete(id);
      fetchLoadouts();
    } catch (error) { alert("Failed to delete loadout"); }
  };

  // ※「編集」ボタンは CreateLoadoutDialog を拡張して使うため、ここでは一旦アラートのみ設定（次回拡張可能）
  const handleEdit = (e: React.MouseEvent, loadout: Loadout) => {
    e.stopPropagation();
    alert(`Edit feature for ${loadout.name} will open the dialog (Implementation ready in API).`);
  };

  return (
    <div className="min-h-screen p-8 bg-zinc-50">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-zinc-800">My Loadouts</h1>
            <p className="text-zinc-500">Plan your packing lists and optimize weight.</p>
          </div>
          <CreateLoadoutDialog />
        </div>

        {/* --- テーブルビュー --- */}
        <div className="rounded-md border bg-white overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loadout Name</TableHead>
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
                    No loadouts created yet. Click "Create Loadout" to start.
                  </TableCell>
                </TableRow>
              ) : (
                loadouts.map((loadout) => (
                  <TableRow 
                    key={loadout.id} 
                    className="cursor-pointer hover:bg-zinc-50"
                    onClick={() => setSelectedLoadout(loadout)} // ★クリックで詳細表示
                  >
                    <TableCell className="font-medium text-base">{loadout.name}</TableCell>
                    <TableCell><Badge variant="secondary">{loadout.activityType}</Badge></TableCell>
                    <TableCell className="flex items-center gap-1 text-muted-foreground">
                      <Package className="h-4 w-4" /> {loadout.items?.length || 0}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {(loadout.totalWeightGram / 1000).toFixed(2)} kg
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={(e) => handleEdit(e, loadout)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="hover:text-red-500" onClick={(e) => handleDelete(e, loadout.id, loadout.name)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* --- 詳細ドロワー (Sheet) --- */}
        <Sheet open={!!selectedLoadout} onOpenChange={(open) => !open && setSelectedLoadout(null)}>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader className="mb-6">
              <Badge variant="outline" className="w-fit mb-2">{selectedLoadout?.activityType}</Badge>
              <SheetTitle className="text-2xl">{selectedLoadout?.name}</SheetTitle>
              <SheetDescription className="flex items-center gap-1 font-mono text-base text-zinc-900 font-medium">
                <Scale className="h-4 w-4" /> Total: {(Number(selectedLoadout?.totalWeightGram) / 1000).toFixed(2)} kg
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <Package className="h-5 w-5 mr-2" /> Packed Gears ({selectedLoadout?.items?.length || 0})
              </h3>
              <div className="space-y-2">
                {selectedLoadout?.items?.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-zinc-50 border rounded-md">
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.properties?.brand || "-"}</div>
                    </div>
                    <Badge variant="secondary" className="font-mono">{item.weightGram}g</Badge>
                  </div>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}