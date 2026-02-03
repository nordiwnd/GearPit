import { gearApi } from "@/lib/api";
import { AddGearDialog } from "@/components/inventory/add-gear-dialog";
import { EditGearDialog } from "@/components/inventory/edit-gear-dialog";
import { SearchBar } from "@/components/inventory/search-bar";
import { MaintenanceDialog } from "@/components/inventory/maintenance-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Next.js 15: Search Params type definition
interface Props {
  searchParams: Promise<{ tag?: string; category?: string; brand?: string }>;
}

export default async function InventoryPage({ searchParams }: Props) {
  // Await search params in Next.js 15
  const filters = await searchParams;

  // Fetch items from Go backend with filters applied
  const items = await gearApi.listItems({
    tag: filters.tag,
    category: filters.category,
    brand: filters.brand,
  });

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

      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Category / Brand</TableHead>
              <TableHead className="text-right">Weight (g)</TableHead>
              <TableHead className="hidden md:table-cell">Tags</TableHead>
              {/* アクション列を追加 */}
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items && items.length > 0 ? (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {item.properties?.category || "-"} / {item.properties?.brand || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.weightGram}g
                  </TableCell>
                  <TableCell className="hidden md:table-cell space-x-1">
                    {item.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-1">
                    {/* メンテナンスボタン */}
                    <MaintenanceDialog item={item} />
                    {/* 編集・削除ボタン */}
                    <EditGearDialog item={item} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No gear matches your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}