"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from "recharts";
import { Package, Scale, Layers, IndianRupee, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { dashboardApi, DashboardStats } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      }
    };
    fetchStats();
  }, []);

  if (!stats) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading analytics...</div>;
  }

  // グラフ用にデータを整形 (重量が0のカテゴリは除外など)
  const pieData = stats.categoryStats
    .filter(c => c.totalWeight > 0)
    .map(c => ({ name: c.category || "Uncategorized", value: c.totalWeight }));

return (
    // bg-zinc-50 dark:bg-zinc-950 に変更
    <div className="min-h-screen p-8 bg-zinc-50 dark:bg-zinc-950 transition-colors space-y-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-50">Dashboard</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Analytics and insights for your gear.</p>
          </div>
          {/* Buttons */}
          <div className="space-x-2">
            <Link href="/">
              <Button variant="outline" className="dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-800 dark:hover:bg-zinc-800"><Package className="mr-2 h-4 w-4" /> Inventory</Button>
            </Link>
            <Link href="/loadouts">
              <Button variant="outline" className="dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-800 dark:hover:bg-zinc-800"><Layers className="mr-2 h-4 w-4" /> Loadouts</Button>
            </Link>
          </div>
        </div>

        {/* KPI Cards (Cards need dark:bg-zinc-900 dark:border-zinc-800) */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Total Gears", icon: Package, value: stats.totalItems, sub: "Items in inventory" },
            { title: "Total Weight", icon: Scale, value: `${(stats.totalWeight / 1000).toFixed(2)} kg`, sub: "Combined weight" },
            { title: "Loadouts", icon: Layers, value: stats.totalLoadouts, sub: "Created packing lists" },
            { title: "Total Cost", icon: IndianRupee, value: `¥${stats.totalCost.toLocaleString()}`, sub: "Maintenance expenses" },
          ].map((item, i) => (
            <Card key={i} className="dark:bg-zinc-900 dark:border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-zinc-200">{item.title}</CardTitle>
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-zinc-50">{item.value}</div>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts (Backgrounds updated) */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1 dark:bg-zinc-900 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="dark:text-zinc-200">Weight Distribution by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => `${value}g`}
                    contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1 dark:bg-zinc-900 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="dark:text-zinc-200">Item Count by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.categoryStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                  <XAxis 
                    dataKey="category" 
                    tick={{fontSize: 12, fill: '#888'}} 
                    tickFormatter={(val) => val || "Other"}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Items" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}