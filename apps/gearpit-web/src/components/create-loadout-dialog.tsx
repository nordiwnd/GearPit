"use client"

import { useState } from "react"
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
import { useRouter } from "next/navigation"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
})

interface CreateLoadoutDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedGearIds: string[]
}

export function CreateLoadoutFromSelectionDialog({ open, onOpenChange, selectedGearIds }: CreateLoadoutDialogProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            const userId = "00000000-0000-0000-0000-000000000001"; // Placeholder

            const items = selectedGearIds.map(id => ({
                gear_id: id,
                quantity: 1, // Default quantity
                packing_category: null // Default category from gear will be used by backend or user can edit later
            }))

            const response = await fetch('/api/loadouts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    name: values.name,
                    description: "Created from selection",
                    items: items,
                }),
            })

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to create loadout. Status:', response.status, 'Body:', errorText);
                throw new Error(`Failed to create loadout: ${response.status} ${errorText}`)
            }

            const loadout = await response.json()
            onOpenChange(false)
            router.push(`/loadouts/${loadout.id}`)
            router.refresh()
        } catch (error) {
            console.error("Error creating loadout:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-[#27272A] border-zinc-800 text-zinc-200">
                <DialogHeader>
                    <DialogTitle className="text-white">Create Loadout</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Create a new loadout with {selectedGearIds.length} selected items.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Loadout Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-zinc-800 hover:text-white">Cancel</Button>
                            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white">Create</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
