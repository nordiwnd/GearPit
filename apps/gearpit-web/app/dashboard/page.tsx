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
    <div className="min-h-screen p-8 bg-zinc-50 space-y-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Nav */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-zinc-800">Dashboard</h1>
            <p className="text-zinc-500">Analytics and insights for your gear.</p>
          </div>
          <div className="space-x-2">
            <Link href="/">
              <Button variant="outline"><Package className="mr-2 h-4 w-4" /> Inventory</Button>
            </Link>
            <Link href="/loadouts">
              <Button variant="outline"><Layers className="mr-2 h-4 w-4" /> Loadouts</Button>
            </Link>
          </div>
        </div>

        {/* 1. KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gears</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <p className="text-xs text-muted-foreground">Items in inventory</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Weight</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.totalWeight / 1000).toFixed(2)} kg</div>
              <p className="text-xs text-muted-foreground">Combined weight</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loadouts</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLoadouts}</div>
              <p className="text-xs text-muted-foreground">Created packing lists</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{stats.totalCost.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Maintenance expenses</p>
            </CardContent>
          </Card>
        </div>

        {/* 2. Charts Section */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Weight Distribution Pie Chart */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Weight Distribution by Category</CardTitle>
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
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    // 修正: 引数の型を any に緩和してTSエラーを回避
                    formatter={(value: any) => `${value}g`}
                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e4e4e7' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Item Count Bar Chart */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Item Count by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.categoryStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="category" 
                    tick={{fontSize: 12}} 
                    tickFormatter={(val) => val || "Other"}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip 
                    cursor={{fill: '#f4f4f5'}}
                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e4e4e7' }}
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