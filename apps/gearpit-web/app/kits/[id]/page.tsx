"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, Kit, GearItem } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Check, Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function KitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [kit, setKit] = useState<Kit | null>(null);
  const [inventory, setInventory] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    Promise.all([api.getKit(id), api.getItems()])
      .then(([k, i]) => { setKit(k); setInventory(i); })
      .finally(() => setLoading(false));
  }, [id]);

  const filteredInventory = useMemo(() => {
    if (!searchQuery) return inventory;
    const q = searchQuery.toLowerCase();
    return inventory.filter(i => i.name.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q));
  }, [inventory, searchQuery]);

  const toggleItem = async (gearId: string) => {
    if (!kit) return;
    const exists = kit.itemIds.includes(gearId);
    let newItemIds;
    
    if (exists) {
      newItemIds = kit.itemIds.filter(id => id !== gearId);
    } else {
      newItemIds = [...kit.itemIds, gearId];
    }

    // Optimistic UI
    setKit({ ...kit, itemIds: newItemIds });

    try {
      await api.updateKit(kit.id, { ...kit, itemIds: newItemIds });
    } catch (error) {
      console.error("Failed to update kit", error);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!kit) return <div className="p-10 text-center">Kit not found</div>;

  return (
    <main className="container mx-auto py-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/kits')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{kit.name}</h1>
          <p className="text-muted-foreground">{kit.itemIds.length} Items defined</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
        {/* Left: Kit Items */}
        <Card className="flex flex-col h-full overflow-hidden border-2 border-primary/20">
          <CardHeader className="py-4 bg-muted/30"><CardTitle className="text-lg">Kit Contents</CardTitle></CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            <ScrollArea className="h-full">
              <div className="divide-y">
                {kit.itemIds.map(itemId => {
                  const gear = inventory.find(i => i.id === itemId);
                  if (!gear) return null;
                  return (
                    <div key={gear.id} className="flex justify-between items-center p-3 hover:bg-muted/50">
                      <div>
                        <p className="font-medium">{gear.name}</p>
                        <p className="text-xs text-muted-foreground">{gear.brand}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => toggleItem(gear.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right: Inventory */}
        <Card className="flex flex-col h-full overflow-hidden">
          <CardHeader className="py-4 space-y-3">
             <CardTitle className="text-lg">Inventory</CardTitle>
             <div className="relative">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input className="pl-9" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
             </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            <ScrollArea className="h-full">
              <div className="divide-y">
                {filteredInventory.map(gear => {
                  const isAdded = kit.itemIds.includes(gear.id);
                  return (
                    <div key={gear.id} className="flex justify-between items-center p-3 hover:bg-muted/50">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                           <p className="font-medium text-sm truncate">{gear.name}</p>
                           <Badge variant="outline" className="text-[10px] h-5 px-1">{gear.category}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{gear.brand}</p>
                      </div>
                      <Button size="sm" variant={isAdded ? "secondary" : "default"} className="ml-2 h-8" onClick={() => toggleItem(gear.id)}>
                        {isAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}