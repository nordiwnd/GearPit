"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Gear, PackingCategory } from "@/types/models"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    gear_id: z.string().min(1, { message: "Please select a gear item." }),
    quantity: z.number().min(1),
    packing_category: z.string().optional(),
})

interface AddGearToLoadoutDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    loadoutId: string
    onSuccess?: () => void
}

export function AddGearToLoadoutDialog({ open, onOpenChange, loadoutId, onSuccess }: AddGearToLoadoutDialogProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [gears, setGears] = useState<Gear[]>([])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            gear_id: "",
            quantity: 1,
            packing_category: "",
        },
    })

    useEffect(() => {
        if (open && gears.length === 0) {
            fetch('/api/gears')
                .then(res => res.json())
                .then(data => setGears(data))
                .catch(err => console.error("Failed to load gears", err))
        }
    }, [open, gears.length])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            const packingCatValue = values.packing_category && values.packing_category !== "default"
                ? values.packing_category
                : null;

            const response = await fetch(`/api/loadouts/${loadoutId}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gear_id: values.gear_id,
                    quantity: values.quantity,
                    packing_category: packingCatValue,
                }),
            })

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to add item: ${response.status} ${errorText}`)
            }

            form.reset()
            onOpenChange(false)
            if (onSuccess) onSuccess()
            router.refresh()
        } catch (error) {
            console.error("Error adding loadout item:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-[#27272A] border-zinc-800 text-zinc-200">
                <DialogHeader>
                    <DialogTitle className="text-white">Add/Update Gear</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Select a gear item from your inventory to add to this loadout. If the item is already added, this will update its quantity and packing category.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="gear_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gear Item</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a gear item" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {gears.map((g) => (
                                                <SelectItem key={g.id} value={g.id}>
                                                    {g.name} ({g.weight_g}g)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="packing_category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Packing Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Default" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="default">Default from Gear</SelectItem>
                                                {Object.values(PackingCategory).map((cat) => (
                                                    <SelectItem key={cat} value={cat}>
                                                        {cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-zinc-800 hover:text-white">Cancel</Button>
                            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white">Save Item</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
