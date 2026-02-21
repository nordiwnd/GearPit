"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Gear } from "./schema"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

import { EditableCell } from "@/components/ui/editable-cell"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash } from "lucide-react"

export const columns: ColumnDef<Gear>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="-ml-4"
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            return (
                <EditableCell
                    value={row.getValue("name")}
                    onSave={(val) => console.log("Saved name:", val, "Row:", row.original.id)}
                />
            )
        },
    },
    {
        accessorKey: "manufacturer",
        header: "Manufacturer",
        cell: ({ row }) => (
            <div className="px-2 py-1 text-xs">{row.getValue("manufacturer")}</div>
        )
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
            <div className="px-2 py-1 text-xs">{row.getValue("category")}</div>
        )
    },
    {
        accessorKey: "weight_g",
        header: ({ column }) => {
            return (
                <div className="text-right">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="-mr-4"
                    >
                        Weight (g)
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => {
            const weight = parseFloat(row.getValue("weight_g"))
            return (
                <EditableCell
                    value={weight}
                    type="number"
                    onSave={(val) => console.log("Saved weight:", val, "Row:", row.original.id)}
                    className="text-right justify-end"
                />
            )
        },
    },
    {
        accessorKey: "price",
        header: () => <div className="text-right px-2">Price</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("price"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount)

            return <div className="text-right font-medium text-xs px-2 py-1">{formatted}</div>
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: function ActionCell({ row }) {
            const gear = row.original

            const handleDelete = async () => {
                if (!confirm(`Are you sure you want to delete ${gear.name}?`)) return
                try {
                    const res = await fetch(`/api/gears/${gear.id}`, { method: 'DELETE' })
                    if (!res.ok) throw new Error("Failed to delete gear")
                    window.location.reload()
                } catch (e) {
                    console.error("Error deleting gear:", e)
                }
            }

            return (
                <div className="flex justify-end pr-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-zinc-800">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#27272A] border-zinc-800 text-zinc-200">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            <DropdownMenuItem
                                className="hover:bg-red-900/50 focus:bg-red-900/50 text-red-400 cursor-pointer focus:text-red-300"
                                onClick={handleDelete}
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete Gear</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    }
]
