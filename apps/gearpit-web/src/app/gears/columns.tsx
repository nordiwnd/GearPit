"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Gear } from "./schema"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

import { EditableCell } from "@/components/ui/editable-cell"

export const columns: ColumnDef<Gear>[] = [
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
]
