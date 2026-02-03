import { format } from 'date-fns';
import { CreateLoadoutDialog } from "@/components/loadout/create-loadout-dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, Calendar, Package } from "lucide-react";
import { loadoutApi } from "@/lib/api"; 

// Next.js 15 Server Component
export default async function LoadoutPage() {
  // バックエンドからLoadout一覧を取得 (SSR)
  const loadouts = await loadoutApi.list();

  return (
    <div className="min-h-screen p-8 bg-zinc-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-800">My Loadouts</h1>
            <p className="text-zinc-500">Plan your packing lists and optimize weight.</p>
          </div>
          <CreateLoadoutDialog />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {loadouts.length === 0 && (
            <p className="text-zinc-500 col-span-2 text-center py-10">No loadouts created yet.</p>
          )}
          
          {loadouts.map((loadout) => (
            <Card key={loadout.id} className="shadow-sm border-zinc-200">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <Badge className="mb-2" variant="secondary">{loadout.activityType}</Badge>
                  <CardTitle className="text-xl font-bold">{loadout.name}</CardTitle>
                </div>
                <div className="flex items-center text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full font-mono font-medium">
                  <Scale className="h-4 w-4 mr-2" />
                  {/* バックエンドで計算された総重量を表示 */}
                  {(loadout.totalWeightGram / 1000).toFixed(2)} kg
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-xs text-zinc-400 mb-4">
                  <Calendar className="h-3 w-3 mr-1" />
                  Updated: {format(new Date(loadout.updatedAt), 'MMM dd, yyyy')}
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-zinc-700 flex items-center">
                    <Package className="h-4 w-4 mr-1" /> Included Gears ({loadout.items?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {loadout.items?.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm p-2 bg-zinc-50 rounded-md border">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-zinc-500">{item.weightGram}g</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}