"use client";

import { useEffect, useState } from "react";
import { api, GearItem } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddGearDialog } from "@/components/inventory/add-gear-dialog"; // 追加

export default function Home() {
  const [items, setItems] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);

  // データ取得関数
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

  return (
    <main className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">My Gear Inventory</h1>
           <p className="text-muted-foreground">Manage your hiking and skiing equipment.</p>
        </div>
        
        {/* ダイアログ配置: 登録完了時に loadItems を呼ぶ */}
        <AddGearDialog onSuccess={loadItems} />
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id}>
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
                  
                  {/* JSONBプロパティの表示 (整形) */}
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
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}