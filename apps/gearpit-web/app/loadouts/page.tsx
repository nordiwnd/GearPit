'use client';

import { useEffect, useState, useCallback } from 'react';
// import axios from 'axios'; // 削除
import { format } from 'date-fns';
import { CreateLoadoutDialog } from "@/components/loadout/create-loadout-dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, Calendar } from "lucide-react";
// import { api } from "@/lib/api"; // 追加

type Loadout = {
  id: string;
  name: string;
  totalWeightGram: number;
  items: any[]; // 詳細は省略
  updatedAt: string;
};

export default function LoadoutPage() {
  const [loadouts, setLoadouts] = useState<Loadout[]>([]);

  const fetchLoadouts = useCallback(() => {
    // 修正: バックエンドのLoadout機能はPhase 2.2で実装するため、一旦空配列をセットしてビルドを通す
    setLoadouts([]); 
  }, []);

  useEffect(() => {
    fetchLoadouts();
  }, [fetchLoadouts]);

  return (
    <div className="min-h-screen p-8 bg-zinc-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-800">My Loadouts</h1>
            <p className="text-zinc-500">Plan your packing lists and optimize weight.</p>
          </div>
          <CreateLoadoutDialog onSuccess={fetchLoadouts} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {loadouts.map((loadout) => (
            <Card key={loadout.id} className="hover:border-zinc-400 transition-colors cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    {loadout.name}
                  </CardTitle>
                  
                  {/* Total Weight Badge */}
                  <div className="flex items-center bg-zinc-100 px-3 py-1.5 rounded-full border border-zinc-200">
                    <Scale className="w-4 h-4 mr-2 text-zinc-500" />
                    <span className="font-mono font-bold text-zinc-900">
                      {loadout.totalWeightGram.toLocaleString()} g
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-zinc-500 mb-4">
                  <Calendar className="w-4 h-4 mr-1" />
                  {format(new Date(loadout.updatedAt), 'yyyy-MM-dd HH:mm')}
                </div>
                
                <div className="flex flex-wrap gap-2">
                   <Badge variant="outline" className="text-zinc-500">
                     {loadout.items?.length || 0} Items
                   </Badge>
                   {/* 余裕があればここに構成品目のプレビューを表示 */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}