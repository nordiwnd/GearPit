"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Droplet, Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { tripApi, Trip, GearItem } from "@/lib/api";

const formSchema = z.object({
    amount: z.coerce.number().min(0, "Amount must be positive"),
});

interface FormData {
    amount: number;
}

interface TripWaterInputProps {
    trip: Trip;
    onSuccess?: () => void;
}

export function TripWaterInput({ trip, onSuccess }: TripWaterInputProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Find existing "Water" item in trip items
    const waterItem = trip.tripItems?.find(ti => ti.item.name === "Carried Water");
    // Default: 1000g = 1000ml (assuming water density approx 1)
    const initialAmount = waterItem ? (waterItem.item.weightGram * waterItem.quantity) : 0;

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            amount: initialAmount,
        },
    });

    const onSubmit = async (values: FormData) => {
        setLoading(true);
        try {
            // 1. Search for a "Carried Water" gear item in the system, or creating one if strictly needed.
            // However, backend logic is simpler if we reuse a standard item.
            // For now, let's assume we find or create an item named "Carried Water".

            // Strategy: Check if "Carried Water" exists in global gear list first.
            let targetItemId = waterItem?.itemId;

            if (!targetItemId) {
                const searchResults = await (await fetch('/api/v1/gears?q=Carried Water')).json();
                const found = searchResults.find((g: GearItem) => g.name === "Carried Water");

                if (found) {
                    targetItemId = found.id;
                } else {
                    // Create it
                    const newItem = await (await fetch('/api/v1/gears', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: "Carried Water",
                            description: "Water carried in containers",
                            manufacturer: "Nature",
                            weightGram: 1, // Base unit weight 1g per 1ml
                            weightType: "consumable", // Water is consumable!
                            unit: "ml"
                        })
                    })).json();
                    targetItemId = newItem.id;
                }

                // Add to trip
                if (targetItemId) {
                    await tripApi.addItems(trip.id, [targetItemId]);
                }
            }

            // 2. Update quantity (since weight is 1g, quantity = total ml)
            // If amount is 0, we could remove it, but setting quantity 0 is safer/easier logic for now or remove.
            if (values.amount > 0 && targetItemId) {
                await tripApi.updateItemQuantity(trip.id, targetItemId, values.amount);
                toast.success("Water amount updated");
            } else if (values.amount === 0 && targetItemId) {
                await tripApi.removeItems(trip.id, [targetItemId]);
                toast.success("Water removed");
            }

            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update water");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2 border rounded-md p-1 bg-background shadow-sm max-w-[240px]">
                <div className="pl-2">
                    <Droplet className="h-4 w-4 text-blue-500" />
                </div>
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem className="mb-0 space-y-0 relative">
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        step="100"
                                        placeholder="0"
                                        className="h-8 w-20 border-none shadow-none focus-visible:ring-0 text-right pr-6"
                                        {...field}
                                    />
                                    <span className="absolute right-1 top-1.5 text-xs text-muted-foreground pointer-events-none">ml</span>
                                </div>

                            </FormControl>
                        </FormItem>
                    )}
                />
                <Button type="submit" size="sm" variant="ghost" className="h-8 px-2" disabled={loading}>
                    <Save className="h-4 w-4" />
                </Button>
            </form>
        </Form>
    );
}
