"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation"; // ルーター追加
import { api, Loadout, GearItem, LoadoutItem } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function LoadoutDetailPage() {
  const params = useParams();
  const router = useRouter(); // ルーター
  const id = params.id as string;

  const [loadout, setLoadout] = useState<Loadout | null>(null);
  const [inventory, setInventory] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // データ初期ロード
  useEffect(() => {
    const init = async () => {
      try {
        const [l, i] = await Promise.all([
          api.getLoadout(id),
          api.getItems()
        ]);
        setLoadout(l);
        setInventory(i);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  // Inventoryの検索フィルタ
  const filteredInventory = useMemo(() => {
    if (!searchQuery) return inventory;
    const lowerQ = searchQuery.toLowerCase();
    return inventory.filter(item => 
      item.name.toLowerCase().includes(lowerQ) || 
      item.brand.toLowerCase().includes(lowerQ) ||
      item.category.toLowerCase().includes(lowerQ)
    );
  }, [inventory, searchQuery]);

  // Loadoutアイテムの詳細データ結合 (Join)
  const loadoutItemsWithDetails = useMemo(() => {
    if (!loadout) return [];
    return (loadout.items || []).map(li => {
      const detail = inventory.find(i => i.id === li.itemId);
      return { ...li, detail };
    });
  }, [loadout, inventory]);

  // --- Actions ---

  // アイテム追加・更新処理
  const updateLoadoutItems = async (newItems: LoadoutItem[]) => {
    if (!loadout) return;

    // 重量の再計算
    const totalWeight = newItems.reduce((sum, item) => {
      const gear = inventory.find(g => g.id === item.itemId);
      return sum + (gear ? gear.weightGram * item.quantity : 0);
    }, 0);

    // Optimistic Update (画面を先に更新)
    const updatedLoadout = { ...loadout, items: newItems, totalWeightGram: totalWeight };
    setLoadout(updatedLoadout);

    try {
      // 修正: 部分更新ではなく、updatedLoadout全体を送る (名前が消えるバグの修正)
      await api.updateLoadout(loadout.id, updatedLoadout);
    } catch (err) {
      console.error("Failed to save loadout", err);
    }
  };

  const addItem = (gearId: string) => {
    if (!loadout) return;
    const existing = loadout.items?.find(i => i.itemId === gearId);
    let newItems;
    
    if (existing) {
      // 既にあるなら数量+1
      newItems = loadout.items.map(i => 
        i.itemId === gearId ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      // 新規追加
      newItems = [...(loadout.items || []), { itemId: gearId, quantity: 1, isChecked: false }];
    }
    updateLoadoutItems(newItems);
  };

  const removeItem = (gearId: string) => {
    if (!loadout) return;
    const newItems = loadout.items.filter(i => i.itemId !== gearId);
    updateLoadoutItems(newItems);
  };

  const updateQuantity = (gearId: string, delta: number) => {
    if (!loadout) return;
    const newItems = loadout.items.map(i => {
      if (i.itemId === gearId) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    });
    updateLoadoutItems(newItems);
  };

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (!loadout) return <div className="text-center p-10">Loadout not found</div>;

  return (
    <main className="container mx-auto py-6 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/loadouts')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{loadout.name}</h1>
          <p className="text-muted-foreground">
            Total Weight: <span className="font-medium text-foreground">{loadout.totalWeightGram}g</span>
             / {loadout.items?.length || 0} Items
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
        
        {/* Left: Current Loadout Items */}
        <Card className="flex flex-col h-full overflow-hidden border-2 border-primary/20">
          <CardHeader className="py-4 bg-muted/30">
            <CardTitle className="text-lg">Packing List</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            <ScrollArea className="h-full">
              <div className="divide-y">
                {loadoutItemsWithDetails.length === 0 && (
                   <p className="p-8 text-center text-muted-foreground text-sm">
                     List is empty. Add items from the right.
                   </p>
                )}
                {loadoutItemsWithDetails.map((item) => (
                  <div key={item.itemId} className="flex items-center justify-between p-4 hover:bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.detail?.name || "Unknown Item"}</p>
                      <p className="text-xs text-muted-foreground">{item.detail?.brand} • {item.detail?.weightGram}g</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border rounded-md">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-r-none" onClick={() => updateQuantity(item.itemId, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-l-none" onClick={() => updateQuantity(item.itemId, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => removeItem(item.itemId)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right: Inventory Source */}
        <Card className="flex flex-col h-full overflow-hidden">
          <CardHeader className="py-4 space-y-3">
            <CardTitle className="text-lg">Inventory</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search gear..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            <ScrollArea className="h-full">
              <div className="divide-y">
                 {filteredInventory.map((gear) => {
                   const isAdded = loadout.items?.some(i => i.itemId === gear.id);
                   return (
                    <div key={gear.id} className="flex items-center justify-between p-3 hover:bg-muted/50 group">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                           <p className="font-medium text-sm truncate">{gear.name}</p>
                           <Badge variant="outline" className="text-[10px] h-5 px-1">{gear.category}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{gear.brand}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant={isAdded ? "secondary" : "default"}
                        className="h-8 text-xs ml-2"
                        onClick={() => addItem(gear.id)}
                      >
                        {isAdded ? "Add Another" : "Add"}
                      </Button>
                    </div>
                   );
                 })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}