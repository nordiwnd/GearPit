"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    description: z.string().optional(),
})

export default function CreateLoadoutPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            // Note: Backend expects user_id. For now hardcoding or assuming backend handles it from context if auth existed.
            // But my backend create_loadout handler EXPECTS user_id in payload?
            // Let's check backend handler `create_loadout` in `apps/gearpit-core/src/api/handlers/loadout.rs`.
            // Wait, previous `view_code_item` of `create_gear` showed `payload.user_id`.
            // So I probably need to send `user_id`.
            // Since there's no auth yet, I'll use a hardcoded test user ID or similar.
            // Or maybe I should check if backend provides a default.
            // In `gears/page.tsx` create gear used `crypto.randomUUID()` for ID but that was MOCK.
            // Backend `create_loadout` likely takes `CreateLoadoutRequest`.

            // I will use a hardcoded user_id for now as auth is not implemented.
            const userId = "00000000-0000-0000-0000-000000000001"; // Placeholder

            const response = await fetch('/api/loadouts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    name: values.name,
                    description: values.description,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to create loadout')
            }

            const loadout = await response.json()
            router.push(`/loadouts/${loadout.id}`)
            router.refresh()
        } catch (error) {
            console.error("Error creating loadout:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-6">
            <div>
                <h1 className="text-xl font-bold tracking-tight">Create Loadout</h1>
                <p className="text-muted-foreground text-xs">Start a new packing list.</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-background border p-4 rounded-md">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Weekend Hike" {...field} />
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
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Optional description..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
