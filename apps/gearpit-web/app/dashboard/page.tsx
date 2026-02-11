"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { toast } from "sonner";

import { dashboardApi, DashboardStats } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { OverviewCards } from "./components/overview-cards";
import { RecentActivity } from "./components/recent-activity";
import { WeightDistribution } from "./components/charts/weight-distribution";
import { CategoryBar } from "./components/charts/category-bar";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch {
        toast.error("Failed to load dashboard data");
      }
    };
    fetchStats();
  }, []);

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-muted-foreground animate-pulse">
        Loading analytics...
      </div>
    );
  }

  // Zero State Handling
  if (stats.totalItems === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6 p-8 bg-zinc-50 dark:bg-zinc-950">
        <div className="p-6 bg-zinc-100 dark:bg-zinc-900 rounded-full shadow-lg">
          <Package className="h-16 w-16 text-zinc-400" />
        </div>
        <div className="text-center space-y-2 max-w-lg">
          <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-50">Welcome to GearPit!</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            It looks like you haven&apos;t added any gear yet. Start by adding items to your inventory to see analytics here.
          </p>
        </div>
        <Link href="/">
          <Button size="lg" className="font-semibold">Go to Inventory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-zinc-50 dark:bg-zinc-950 transition-colors space-y-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Overview of your inventory, value, and activities.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Future actions: Date range picker, Export, etc. */}
          </div>
        </div>

        {/* Overview Cards */}
        <OverviewCards stats={stats} />

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
          {/* Charts Section */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <WeightDistribution stats={stats} />
              <CategoryBar stats={stats} />
            </div>
          </div>

          {/* Activity Section */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}