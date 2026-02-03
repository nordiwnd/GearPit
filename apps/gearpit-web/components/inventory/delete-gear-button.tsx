"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { gearApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface DeleteGearButtonProps {
  itemId: string;
  itemName: string;
}

export function DeleteGearButton({ itemId, itemName }: DeleteGearButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) return;

    setLoading(true);
    try {
      await gearApi.deleteItem(itemId);
      router.refresh(); // 削除後、一覧を自動リフレッシュ
    } catch (error) {
      console.error(error);
      alert("Failed to delete item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleDelete} 
      disabled={loading}
      title="Delete Gear"
      className="text-muted-foreground hover:text-red-500 hover:bg-red-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}