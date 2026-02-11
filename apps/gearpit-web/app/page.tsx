import { Suspense } from "react";
import { AddGearDialog } from "@/components/inventory/add-gear-dialog";
import { SearchBar } from "@/components/inventory/search-bar";
import { GearList } from "@/components/inventory/gear-list";
import { GearListSkeleton } from "@/components/inventory/gear-list-skeleton";

// Next.js 15: Search Params type definition
interface Props {
  searchParams: Promise<{ tag?: string; category?: string; brand?: string }>;
}

export default async function InventoryPage({ searchParams }: Props) {
  // Await search params in Next.js 15
  const filters = await searchParams;

  return (
    <main className="container mx-auto py-8 px-4 md:px-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gear Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Manage your equipment, specs, and maintenance logs.
          </p>
        </div>
        <AddGearDialog />
      </div>

      {/* 検索バーの追加 */}
      <div className="bg-card border rounded-md p-4">
        <SearchBar />
      </div>

      <Suspense fallback={<GearListSkeleton />}>
        <GearList filters={filters} />
      </Suspense>
    </main>
  );
}