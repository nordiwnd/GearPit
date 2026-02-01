"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Kit } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
// ダイアログをインポート
import { CreateKitDialog } from "@/components/kit/create-kit-dialog";

export default function KitsPage() {
  const router = useRouter();
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKits = async () => {
    try {
      const data = await api.getKits();
      setKits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKits();
  }, []);

  // handleCreate は削除し、ダイアログに置き換える

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this kit?")) return;
    try {
      await api.deleteKit(id);
      setKits(prev => prev.filter(k => k.id !== id));
    } catch (error) {
      alert("Failed to delete");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Kits...</div>;

  return (
    <main className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gear Kits</h1>
        {/* ダイアログを配置 */}
        <CreateKitDialog onSuccess={fetchKits} />
      </div>

      {/* 一覧表示部分はそのまま */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kits.map((kit) => (
          <Card 
            key={kit.id} 
            className="cursor-pointer hover:border-primary/50 relative group"
            onClick={() => router.push(`/kits/${kit.id}`)}
          >
            <CardHeader className="pb-2">
              <CardTitle>{kit.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* itemIdsがnull/undefinedの場合の安全対策 */}
              <p className="text-sm text-muted-foreground">{kit.itemIds?.length || 0} items</p>
            </CardContent>
            
            <Button
              variant="ghost" size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
              onClick={(e) => handleDelete(kit.id, e)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>
    </main>
  );
}