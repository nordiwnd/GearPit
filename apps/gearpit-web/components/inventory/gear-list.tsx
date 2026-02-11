import { gearApi } from "@/lib/api";
import { MaintenanceDialog } from "@/components/inventory/maintenance-dialog";
import { EditGearDialog } from "@/components/inventory/edit-gear-dialog";
import { DeleteGearButton } from "@/components/inventory/delete-gear-button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface GearListProps {
    filters: {
        tag?: string;
        category?: string;
        brand?: string;
    };
}

export async function GearList({ filters }: GearListProps) {
    // Fetch items from Go backend with filters applied
    const items = await gearApi.listItems(filters);

    return (
        <div className="rounded-md border bg-card overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">Name</TableHead>
                        <TableHead>Category / Brand</TableHead>
                        <TableHead className="text-right">Weight (g)</TableHead>
                        <TableHead className="hidden md:table-cell">Tags</TableHead>
                        <TableHead className="w-[120px] text-right">Usage</TableHead>
                        {/* Action column */}
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
                                        {item.properties?.category || "-"} /{" "}
                                        {item.properties?.brand || "-"}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">{item.weightGram}g</TableCell>
                                <TableCell className="hidden md:table-cell space-x-1">
                                    {item.tags?.map((tag) => (
                                        <Badge key={tag} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </TableCell>
                                <TableCell className="text-right">
                                    <span
                                        className={
                                            item.maintenanceInterval > 0 &&
                                                item.usageCount >= item.maintenanceInterval
                                                ? "text-red-500 font-bold"
                                                : "text-muted-foreground"
                                        }
                                    >
                                        {item.usageCount}
                                        {item.maintenanceInterval > 0 &&
                                            ` / ${item.maintenanceInterval}`}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end items-center gap-1">
                                        {/* Maintenance Button */}
                                        <MaintenanceDialog item={item} />
                                        {/* Edit Button */}
                                        <EditGearDialog item={item} />
                                        {/* Delete Button */}
                                        <DeleteGearButton itemId={item.id} itemName={item.name} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="h-24 text-center text-muted-foreground"
                            >
                                No gear matches your criteria.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
