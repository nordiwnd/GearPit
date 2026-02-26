"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Loadout } from "@/types/models"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Copy, Eye, Trash2 } from "lucide-react"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const columns: ColumnDef<Loadout>[] = [
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
                <div className="font-medium">
                    <Link href={`/loadouts/${row.original.id}`} className="hover:underline">
                        {row.getValue("name")}
                    </Link>
                </div>
            )
        },
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
            <div className="text-muted-foreground text-xs truncate max-w-[300px]">
                {row.getValue("description")}
            </div>
        )
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Created
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = new Date(row.getValue("created_at"))
            return <div className="text-xs">{date.toLocaleDateString()}</div>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const loadout = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#27272A] border-zinc-800 text-zinc-200">
                        <DropdownMenuLabel className="text-zinc-400">Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(loadout.id)} className="hover:bg-zinc-800 hover:text-white cursor-pointer focus:bg-zinc-800 focus:text-white">
                            <Copy className="mr-2 h-4 w-4" />
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem onClick={() => window.location.href = `/loadouts/${loadout.id}`} className="hover:bg-zinc-800 hover:text-white cursor-pointer focus:bg-zinc-800 focus:text-white">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-red-400/10 cursor-pointer focus:text-red-300 focus:bg-red-400/10">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
