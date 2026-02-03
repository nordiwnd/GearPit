import { gearApi } from "@/lib/api";
import { AddGearDialog } from "@/components/inventory/add-gear-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Next.js 15 Server Component: Fetches data directly on the server
export default async function InventoryPage() {
  // Fetch items from the Go backend
  const items = await gearApi.listItems();

  return (
    <main className="container mx-auto py-8 px-4 md:px-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gear Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Manage your equipment, specs, and maintenance logs.
          </p>
        </div>
        <AddGearDialog />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Category / Brand</TableHead>
              <TableHead className="text-right">Weight (g)</TableHead>
              <TableHead className="hidden md:table-cell">Tags</TableHead>
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
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No gear registered yet. Click "Add Gear" to start.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}