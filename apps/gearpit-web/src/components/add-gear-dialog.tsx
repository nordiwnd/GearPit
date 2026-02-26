"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
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
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { GearFormSchema, GearPropertiesSchema } from "@/app/gears/validation"
import { Gear } from "@/types/models"

const formSchema = GearFormSchema

export type AddGearFormValues = z.infer<typeof formSchema>

interface AddGearDialogProps {
    onSuccess: (gear: Gear) => void
}

export function AddGearDialog({ onSuccess }: AddGearDialogProps) {
    const [open, setOpen] = useState(false)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            manufacturer: "",
            weight_g: 0,
            price: 0,
            category: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const rawProps = {
                type: values.category,
                data: values.properties || {}
            };
            
            const parsedPropsValidate = GearPropertiesSchema.safeParse(rawProps);
            if (!parsedPropsValidate.success) {
                console.error("Category properties validation failed:", parsedPropsValidate.error);
                throw new Error("Category properties validation failed");
            }

            const payload = {
                ...values,
                user_id: "00000000-0000-0000-0000-000000000001",
                properties: parsedPropsValidate.data
            }

            const res = await fetch('/api/gears', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const errorText = await res.text()
                console.error("API Error Response:", res.status, errorText)
                throw new Error(`Failed to create gear. ${res.status}: ${errorText}`)
            }
            const newGear = await res.json()
            onSuccess(newGear)
            setOpen(false)
            form.reset()
        } catch (error) {
            console.error("Failed to add gear:", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 text-xs">Add Gear</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#27272A] border-zinc-800 text-zinc-200">
                <DialogHeader>
                    <DialogTitle className="text-white">Add New Gear</DialogTitle>
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
                                        <Input placeholder="Ultralight Tent" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="manufacturer"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Manufacturer</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Black Diamond" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="weight_g"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Weight (g)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price ($)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Ski">Ski</SelectItem>
                                            <SelectItem value="Backpack">Backpack</SelectItem>
                                            <SelectItem value="Tent">Tent</SelectItem>
                                            <SelectItem value="Pole">Pole</SelectItem>
                                            <SelectItem value="Boots">Boots</SelectItem>
                                            <SelectItem value="IceAxe">Ice Axe</SelectItem>
                                            <SelectItem value="Crampons">Crampons</SelectItem>
                                            <SelectItem value="HardShell">Hard Shell</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {form.watch("category") === "Ski" && (
                            <div className="space-y-4 border p-4 rounded-md mt-4">
                                <h4 className="font-medium">Ski Properties</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="properties.length_mm"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Length (mm)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="properties.radius_m"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Radius (m)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.1" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="col-span-2 grid grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="properties.dimensions_mm.tip"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tip (mm)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="properties.dimensions_mm.waist"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Waist (mm)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="properties.dimensions_mm.tail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tail (mm)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="properties.binding_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Binding Type</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Tech, Alpine..." {...field} value={field.value ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="properties.is_preloaded_binding"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Preloaded Binding</FormLabel>
                                                <Select onValueChange={(val) => field.onChange(val === "true")} value={field.value ? "true" : "false"}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Yes or No" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="true">Yes</SelectItem>
                                                        <SelectItem value="false">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {form.watch("category") === "Backpack" && (
                            <div className="space-y-4 border p-4 rounded-md mt-4">
                                <h4 className="font-medium">Backpack Properties</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="properties.capacity_liters"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Capacity (L)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="properties.back_length_size"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Back Length Size</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="S, M, L..." {...field} value={field.value ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="properties.has_frame"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Has Frame</FormLabel>
                                                <Select onValueChange={(val) => field.onChange(val === "true")} value={field.value ? "true" : "false"}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Yes or No" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="true">Yes</SelectItem>
                                                        <SelectItem value="false">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {form.watch("category") === "Tent" && (
                            <div className="space-y-4 border p-4 rounded-md mt-4">
                                <h4 className="font-medium">Tent Properties</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="properties.capacity_persons"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Capacity (Persons)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="properties.water_resistance_mm"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Water Resistance (mm)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="properties.shape"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Shape</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Dome, Tunnel..." {...field} value={field.value ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="properties.is_double_wall"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Double Wall</FormLabel>
                                                <Select onValueChange={(val) => field.onChange(val === "true")} value={field.value ? "true" : "false"}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Yes or No" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="true">Yes</SelectItem>
                                                        <SelectItem value="false">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {form.watch("category") === "Pole" && (
                            <div className="space-y-4 border p-4 rounded-md mt-4">
                                <h4 className="font-medium">Pole Properties</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="properties.packed_length_mm"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Packed Length (mm)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="properties.material"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Material</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Carbon, Aluminum..." {...field} value={field.value ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="properties.is_adjustable"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Adjustable</FormLabel>
                                                <Select onValueChange={(val) => field.onChange(val === "true")} value={field.value ? "true" : "false"}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Yes or No" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="true">Yes</SelectItem>
                                                        <SelectItem value="false">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="properties.adjustment_stages"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Stages</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="col-span-2 grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="properties.length_range_mm.min"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Min Length (mm)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="properties.length_range_mm.max"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Max Length (mm)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {form.watch("category") === "Boots" && (
                            <div className="space-y-4 border p-4 rounded-md mt-4">
                                <h4 className="font-medium">Boots Properties</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="properties.size_cm"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Size (cm)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.5" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="properties.stiffness"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Stiffness</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Soft, Medium, Stiff..." {...field} value={field.value ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="properties.sole_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sole Type</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Vibram..." {...field} value={field.value ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="col-span-2">
                                        <FormLabel>Welt Compatibility</FormLabel>
                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <FormField
                                                control={form.control}
                                                name="properties.welt_compatibility.front"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Front</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="None, Semi..." {...field} value={field.value ?? ""} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="properties.welt_compatibility.rear"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Rear</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="None, Auto..." {...field} value={field.value ?? ""} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {form.watch("category") === "IceAxe" && (
                            <div className="space-y-4 border p-4 rounded-md mt-4">
                                <h4 className="font-medium">Ice Axe Properties</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="properties.length_mm"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Length (mm)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="properties.weight_balance"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Weight Balance</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Head, Shaft..." {...field} value={field.value ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="properties.shaft_shape"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Shaft Shape</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Straight, Curved..." {...field} value={field.value ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {form.watch("category") === "Crampons" && (
                            <div className="space-y-4 border p-4 rounded-md mt-4">
                                <h4 className="font-medium">Crampons Properties</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="properties.points_count"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Points Count</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="properties.attachment_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Attachment Type</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Automatic, Semi-Auto..." {...field} value={field.value ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="properties.material"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Material</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Steel, Aluminum..." {...field} value={field.value ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {form.watch("category") === "HardShell" && (
                            <div className="space-y-4 border p-4 rounded-md mt-4">
                                <h4 className="font-medium">Hard Shell Properties</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="properties.water_resistance_mm"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Water Resistance (mm)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="properties.moisture_permeability_g"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Breathability (g)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="properties.material_tech"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Material Tech</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Gore-Tex..." {...field} value={field.value ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="properties.has_ventilation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ventilation</FormLabel>
                                                <Select onValueChange={(val) => field.onChange(val === "true")} value={field.value ? "true" : "false"}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Yes or No" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="true">Yes</SelectItem>
                                                        <SelectItem value="false">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}
                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">Save Gear</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
