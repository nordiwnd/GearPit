"use client";

import { useEffect, useState } from "react";
import { api, Kit, LoadoutItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Layers, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

interface ImportKitDialogProps {
  onImport: (newItems: LoadoutItem[]) => void; // 親にアイテム配列を渡す
  currentItems: LoadoutItem[];
}

export function ImportKitDialog({ onImport, currentItems }: ImportKitDialogProps) {
  const [open, setOpen] = useState(false);
  const [kits, setKits] = useState<Kit[]>([]);

  // ダイアログが開いたときにKit一覧を取得
  useEffect(() => {
    if (open) {
      api.getKits().then(setKits).catch(console.error);
    }
  }, [open]);

  const handleImport = (kit: Kit) => {
    if (!confirm(`Import items from "${kit.name}"?`)) return;

    // 既存のアイテムマップを作成 (ID -> Item)
    const itemMap = new Map(currentItems.map(i => [i.itemId, i]));

    // Kitのアイテムをマージ
    kit.itemIds.forEach(kitItemId => {
      if (itemMap.has(kitItemId)) {
        // 既にリストにある場合は数量を+1する (または何もしない仕様もアリだが、今回は加算)
        const existing = itemMap.get(kitItemId)!;
        itemMap.set(kitItemId, { ...existing, quantity: existing.quantity + 1 });
      } else {
        // 新規追加
        itemMap.set(kitItemId, { itemId: kitItemId, quantity: 1, isChecked: false });
      }
    });

    onImport(Array.from(itemMap.values()));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hidden md:flex">
          <Layers className="mr-2 h-4 w-4" /> Import Kit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import from Kit</DialogTitle>
          <DialogDescription>
            Select a kit to add its items to your current loadout.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[300px] mt-4">
          <div className="grid gap-3">
            {kits.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No kits found.</p>
            )}
            {kits.map((kit) => (
              <Card 
                key={kit.id} 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleImport(kit)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{kit.name}</p>
                    <p className="text-xs text-muted-foreground">{kit.itemIds.length} items</p>
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}