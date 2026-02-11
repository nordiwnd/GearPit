"use client";

import { useState, useEffect } from 'react';
import { Layers, Loader2, Plus, Check } from 'lucide-react';
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { loadoutApi, tripApi, Loadout } from "@/lib/api";

interface Props {
  tripId: string;
  onSuccess: () => void;
}

export function AddLoadoutToTripDialog({ tripId, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [loadouts, setLoadouts] = useState<Loadout[]>([]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      loadoutApi.list()
        .then(res => setLoadouts(res || []))
        .catch(() => toast.error("Failed to load loadouts"))
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleAdd = async (loadout: Loadout) => {
    if (!loadout.items || loadout.items.length === 0) {
      toast.warning("This loadout is empty.");
      return;
    }

    setAdding(true);
    try {
      // Loadout内のItem IDを抽出
      const itemIds = loadout.items.map(item => item.id);

      // Tripに追加 (重複はAPI/DB側で無視されるか、すべて追加されるかはDB実装次第)
      // ★注意: 現状のDB設計では同じアイテムIDは1つしか登録されない可能性があります(Unique制約がある場合)。
      // ユーザー要望の「同じアイテムを複数」は、次のフェーズでDBスキーマ変更後に完全対応します。
      await tripApi.addItems(tripId, itemIds);

      toast.success(`Added ${itemIds.length} items from "${loadout.name}"`);
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast.error("Failed to add items from loadout");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Layers className="mr-2 h-4 w-4" /> Add from Loadout
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md h-[60vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Loadout to Copy</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 border rounded-md bg-muted/50 p-2">
          {loading ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
          ) : loadouts.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">No loadouts created yet.</div>
          ) : (
            <div className="space-y-2">
              {loadouts.map(loadout => (
                <div
                  key={loadout.id}
                  className="flex items-center justify-between p-3 bg-card border rounded-md hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm text-foreground">{loadout.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px] h-5">{loadout.activityType}</Badge>
                      <span className="text-xs text-muted-foreground">{loadout.items?.length || 0} items</span>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleAdd(loadout)} disabled={adding}>
                    {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}