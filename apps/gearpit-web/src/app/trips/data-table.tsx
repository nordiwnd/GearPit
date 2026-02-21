"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useState } from "react"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    })

    const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, colIndex: number, cellId: string) => {
        // Enter key: Activate edit mode if applicable
        if (e.key === "Enter") {
            e.preventDefault()
            // Find the editable child and trigger its click or focus
            const target = e.currentTarget as HTMLElement
            const editableChild = target.querySelector('[data-editable="true"]') as HTMLElement
            if (editableChild) {
                editableChild.click()
            }
            return
        }

        // Arrow key navigation
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault()
            const rowCount = table.getRowModel().rows.length
            const colCount = columns.length

            let nextRow = rowIndex
            let nextCol = colIndex

            if (e.key === "ArrowUp") nextRow = Math.max(0, rowIndex - 1)
            if (e.key === "ArrowDown") nextRow = Math.min(rowCount - 1, rowIndex + 1)
            if (e.key === "ArrowLeft") nextCol = Math.max(0, colIndex - 1)
            if (e.key === "ArrowRight") nextCol = Math.min(colCount - 1, colIndex + 1)

            const nextCell = document.querySelector(`[data-row="${nextRow}"][data-col="${nextCol}"]`) as HTMLElement
            nextCell?.focus()
        }
    }

    return (
        <div className="rounded-md border border-zinc-800 bg-[#27272A] overflow-hidden">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="h-8 hover:bg-transparent border-b border-zinc-800 bg-zinc-900/40">
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id} className="h-8 px-4 text-xs font-semibold text-zinc-400">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row, rowIndex) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                className="h-10 hover:bg-zinc-800/50 border-b border-zinc-800/50 transition-colors group"
                            >
                                {row.getVisibleCells().map((cell, colIndex) => (
                                    <TableCell
                                        key={cell.id}
                                        className="p-0 h-10 focus-within:ring-1 focus-within:ring-emerald-500/50 focus-within:z-10 relative px-4 text-zinc-300 font-medium"
                                    // We delegate focus handling to the inner EditableCell or use this cell as nav container
                                    // But EditableCell also has tabIndex.
                                    // Strategy: The *Cell* itself is the nav target if it doesn't contain an editable.
                                    // But here we put EditableCell inside.
                                    // Check EditableCell implementation: it has tabIndex=0.
                                    >
                                        <div
                                            // Wrapper to capture key events for navigation
                                            onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex, cell.id)}
                                            data-row={rowIndex}
                                            data-col={colIndex}
                                            tabIndex={0}
                                            className="h-full w-full flex items-center outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-emerald-500/5 transition-colors"
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center text-sm font-mono tracking-widest text-zinc-500 uppercase">
                                No records found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
