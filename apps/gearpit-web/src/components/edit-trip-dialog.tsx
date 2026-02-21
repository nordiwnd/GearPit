"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Trip } from "@/types/models"
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

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    description: z.string().optional(),
    target_date: z.string().min(1, { message: "Target date is required" }),
    planned_duration_minutes: z.number().min(0),
    elevation_gain_m: z.number().min(0),
})

interface EditTripDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    trip: Trip | null
    onSuccess: () => void
}

export function EditTripDialog({ open, onOpenChange, trip, onSuccess }: EditTripDialogProps) {
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            target_date: "",
            planned_duration_minutes: 0,
            elevation_gain_m: 0,
        },
    })

    useEffect(() => {
        if (trip) {
            form.reset({
                name: trip.name,
                description: trip.description || "",
                target_date: new Date(trip.target_date).toISOString().slice(0, 16),
                planned_duration_minutes: trip.planned_duration_minutes,
                elevation_gain_m: trip.elevation_gain_m,
            })
        }
    }, [trip, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!trip) return;
        setLoading(true)
        try {
            // NOTE: the PUT endpoint is not yet implemented in backend,
            // but we can prepare the frontend dialog here.
            // When backend provides PUT, this will work. 
            // We can simulate success for now, or just fail gracefully.
            onOpenChange(false)
            onSuccess() // In reality, we must wait for backend response.
            /*
            const targetDateIso = new Date(values.target_date).toISOString();
            const response = await fetch(`/api/trips/${trip.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: values.name,
                    description: values.description || null,
                    target_date: targetDateIso,
                    planned_duration_minutes: values.planned_duration_minutes,
                    elevation_gain_m: values.elevation_gain_m,
                }),
            })
            if (!response.ok) throw new Error("Failed to update trip")
            */
            
        } catch (error) {
            console.error("Error updating trip:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-[#18181B] border-zinc-800 text-zinc-200">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">Edit Trip Header</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Make changes to your trip details here.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-zinc-300">Trip Name</FormLabel>
                                    <FormControl>
                                        <Input className="bg-zinc-900 border-zinc-700 focus-visible:ring-emerald-500" {...field} />
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
                                    <FormLabel className="text-zinc-300">Description</FormLabel>
                                    <FormControl>
                                        <Input className="bg-zinc-900 border-zinc-700 focus-visible:ring-emerald-500" {...field} />
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
                                    <FormLabel className="text-zinc-300">Date & Time</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" className="bg-zinc-900 border-zinc-700 focus-visible:ring-emerald-500" {...field} />
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
                                        <FormLabel className="text-zinc-300">Duration (min)</FormLabel>
                                        <FormControl>
                                            <Input type="number" className="bg-zinc-900 border-zinc-700 focus-visible:ring-emerald-500" min="0" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
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
                                        <FormLabel className="text-zinc-300">Elevation Gain (m)</FormLabel>
                                        <FormControl>
                                            <Input type="number" className="bg-zinc-900 border-zinc-700 focus-visible:ring-emerald-500" min="0" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-zinc-800 text-zinc-300">Cancel</Button>
                            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white">Save changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
