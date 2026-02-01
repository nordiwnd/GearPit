"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // 追加
import { api, Loadout } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { CreateLoadoutDialog } from "@/components/loadout/create-loadout-dialog";
import { EditLoadoutDialog } from "@/components/loadout/edit-loadout-dialog";

export default function LoadoutsPage() {
  const router = useRouter(); // ルーターフック
  const [loadouts, setLoadouts] = useState<Loadout[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoadouts = async () => {
    try {
      const data = await api.getLoadouts();
      setLoadouts(data);
    } catch (err) {
      console.error("Failed to fetch loadouts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoadouts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this loadout?")) return;
    try {
      await api.deleteLoadout(id);
      setLoadouts((prev) => prev.filter((l) => l.id !== id));
    } catch (error) {
      console.error(error);
      alert("削除に失敗しました");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Loadouts...</div>;

  return (
    <main className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Loadouts</h1>
        <CreateLoadoutDialog onSuccess={fetchLoadouts} />
      </div>
      
      {loadouts.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No loadouts created yet.</p>
          <CreateLoadoutDialog onSuccess={fetchLoadouts} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadouts.map((loadout) => (
            <Card 
              key={loadout.id} 
              className="relative group hover:border-primary/50 transition-colors cursor-pointer"
              // カード全体をクリックしたら詳細画面へ遷移
              onClick={() => router.push(`/loadouts/${loadout.id}`)}
            >
              <CardHeader className="pb-2 pr-12">
                <CardTitle className="truncate" title={loadout.name}>
                  {loadout.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Items: {loadout.items?.length || 0}
                  </p>
                  <p className="text-sm font-medium">
                    Total Weight: {loadout.totalWeightGram}g
                  </p>
                </div>
              </CardContent>

              {/* Action Buttons: 親のonClick(遷移)を止めるためdivで囲う */}
              <div 
                className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-background/80 rounded-md backdrop-blur-sm p-1"
                onClick={(e) => e.stopPropagation()} // ここ重要
              >
                <EditLoadoutDialog loadout={loadout} onSuccess={fetchLoadouts} />
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-red-500"
                  onClick={() => handleDelete(loadout.id)}
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