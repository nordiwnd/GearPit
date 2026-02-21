"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Trip } from "@/types/models"
import { Calendar, Eye, MoreHorizontal, Pencil, Trash } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { EditTripDialog } from "@/components/edit-trip-dialog"

export const columns: ColumnDef<Trip>[] = [
    {
        accessorKey: "name",
        header: "Trip Name",
        cell: ({ row }) => {
            return (
                <div className="font-semibold text-zinc-100 flex items-center">
                    {row.getValue("name")}
                </div>
            )
        },
    },
    {
        accessorKey: "target_date",
        header: "Target Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("target_date"));
            return (
                <div className="flex items-center text-zinc-400 font-mono text-sm">
                    <Calendar className="w-3.5 h-3.5 mr-2 text-zinc-500" />
                    {date.toLocaleDateString()}
                </div>
            )
        },
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
            const description = row.getValue("description") as string | null
            return (
                <div className="text-zinc-500 text-sm truncate max-w-[300px]" title={description || ""}>
                    {description || "-"}
                </div>
            )
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: function ActionCell({ row }) {
            const trip = row.original
            const router = useRouter()
            const [editOpen, setEditOpen] = useState(false)

            const handleDelete = async () => {
                if (!confirm(`Are you sure you want to delete ${trip.name}?`)) return
                try {
                    const res = await fetch(`/api/trips/${trip.id}`, { method: 'DELETE' })
                    if (!res.ok) throw new Error("Failed to delete trip")
                    // Since it's a client component used inside a generic DataTable,
                    // the simplest way to refresh is router.refresh() if the parent page handles data,
                    // but the parent page has its own state. A full reload works, or better:
                    window.location.reload()
                } catch (e) {
                    console.error("Error deleting trip:", e)
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
                            <DropdownMenuItem asChild className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">
                                <Link href={`/trips/${trip.id}`} className="flex items-center">
                                    <Eye className="mr-2 h-4 w-4 text-emerald-500" />
                                    <span>View Details</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer"
                                onClick={() => setEditOpen(true)}
                            >
                                <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                                <span>Edit Header</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            <DropdownMenuItem
                                className="hover:bg-red-900/50 focus:bg-red-900/50 text-red-400 cursor-pointer focus:text-red-300"
                                onClick={handleDelete}
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete Trip</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <EditTripDialog
                        open={editOpen}
                        onOpenChange={setEditOpen}
                        trip={trip}
                        onSuccess={() => window.location.reload()}
                    />
                </div>
            )
        },
    }
]
