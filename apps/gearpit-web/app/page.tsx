"use client";

import { useEffect, useState } from "react";
import { api, GearItem } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddGearDialog } from "@/components/inventory/add-gear-dialog";
import { Pencil, Trash2 } from "lucide-react"; // アイコン追加

export default function Home() {
  const [items, setItems] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await api.getItems();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // 削除ハンドラ
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.deleteItem(id);
      // 成功したら一覧から除去 (再取得より高速)
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      alert("削除に失敗しました");
    }
  };

  return (
    <main className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">My Gear Inventory</h1>
           <p className="text-muted-foreground">Manage your hiking and skiing equipment.</p>
        </div>
        
        {/* 新規登録ボタン */}
        <AddGearDialog onSuccess={loadItems} />
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="relative group">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.brand}</p>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </div>
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight:</span>
                    <span className="font-medium">{item.weightGram}g</span>
                  </div>
                  
                  {item.properties && Object.keys(item.properties).length > 0 && (
                    <div className="bg-muted/30 p-2 rounded mt-2 space-y-1">
                      {Object.entries(item.properties).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-xs">
                           <span className="text-muted-foreground capitalize">{k.replace('_', ' ')}:</span>
                           <span>{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>

              {/* Action Buttons (Hoverで表示、Mobileは常時表示推奨だが簡易化) */}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 p-1 rounded backdrop-blur-sm">
                {/* 編集ボタン: Dialogをトリガーとして使用 */}
                <AddGearDialog 
                  itemToEdit={item} 
                  onSuccess={loadItems}
                  trigger={
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  }
                />
                
                {/* 削除ボタン */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}