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
    DialogTrigger,
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
    description: z.string().optional(),
    target_date: z.string().min(1, { message: "Target date is required" }),
    planned_duration_minutes: z.number().min(0),
    elevation_gain_m: z.number().min(0),
})

interface CreateTripDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    baseLoadoutId?: string
}

export function CreateTripDialog({ open, onOpenChange, baseLoadoutId }: CreateTripDialogProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            target_date: new Date().toISOString().slice(0, 16), // YYYY-MM-DDThh:mm format for datetime-local
            planned_duration_minutes: 120,
            elevation_gain_m: 500,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            const userId = "00000000-0000-0000-0000-000000000001"; // Placeholder

            // Ensure the date is sent as a full ISO chronos string (UTC)
            const targetDateIso = new Date(values.target_date).toISOString();

            const response = await fetch('/api/trips', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    name: values.name,
                    description: values.description || null,
                    target_date: targetDateIso,
                    planned_duration_minutes: values.planned_duration_minutes,
                    elevation_gain_m: values.elevation_gain_m,
                    base_loadout_id: baseLoadoutId || null,
                }),
            })

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create trip: ${response.status} ${errorText}`)
            }

            const trip = await response.json()
            onOpenChange(false)
            router.push(`/trips/${trip.id}`)
            router.refresh()
        } catch (error) {
            console.error("Error creating trip:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-[#27272A] border-zinc-800 text-zinc-200">
                <DialogHeader>
                    <DialogTitle className="text-white">Create Trip</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        {baseLoadoutId ? "Create a new trip using this loadout as a base." : "Create a new trip."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Trip Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="E.g., Mt. Blanc Summit" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Details about route, weather..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="target_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date & Time</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="planned_duration_minutes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration (min)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="elevation_gain_m"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Elevation Gain (m)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-zinc-800 hover:text-white">Cancel</Button>
                            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white">Create</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    )
}
