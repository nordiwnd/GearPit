'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // バッジコンポーネントも使うとかっこいい
import { AddGearDialog } from "@/components/inventory/add-gear-dialog"; // 作成したコンポーネント

// APIレスポンスの型定義
type Gear = {
  id: string;
  name: string;
  brand: string;
  weightGram: number;
  tags?: string[];
  properties?: Record<string, any>;
};

export default function Home() {
  const [gears, setGears] = useState<Gear[]>([]);
  const [error, setError] = useState('');

  // データ取得関数
  const fetchGears = useCallback(() => {
    axios.get('http://localhost:8080/api/v1/gears')
      .then((res) => {
        setGears(res.data.items || []);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch data from Backend');
      });
  }, []);

  // 初回ロード
  useEffect(() => {
    fetchGears();
  }, [fetchGears]);

  return (
    <div className="min-h-screen p-8 bg-zinc-50">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Area */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-800">GearPit Inventory</h1>
            <p className="text-zinc-500">Manage your gears for hiking, skiing, and more.</p>
          </div>
          {/* Add Dialog */}
          <AddGearDialog onSuccess={fetchGears} />
        </div>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* List Area */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gears.map((gear) => (
            <Card key={gear.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                     <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">{gear.brand}</p>
                     <CardTitle className="text-lg">{gear.name}</CardTitle>
                  </div>
                  <span className="font-mono text-sm bg-zinc-100 px-2 py-1 rounded">
                    {gear.weightGram}g
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {/* Properties (JSONB) Display */}
                {gear.properties && Object.keys(gear.properties).length > 0 && (
                  <div className="mb-3 space-y-1">
                    {Object.entries(gear.properties).map(([key, value]) => (
                      <div key={key} className="text-sm flex justify-between border-b border-zinc-100 pb-1">
                        <span className="text-zinc-500">{key}:</span>
                        <span className="font-medium text-zinc-700">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tags Display */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {gear.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs font-normal">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}