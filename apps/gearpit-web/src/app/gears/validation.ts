import * as z from "zod"

export const DimensionsSchema = z.object({
    tip: z.coerce.number().min(0),
    waist: z.coerce.number().min(0),
    tail: z.coerce.number().min(0),
})

export const LengthRangeSchema = z.object({
    min: z.coerce.number().min(0),
    max: z.coerce.number().min(0),
})

export const SkiPropsSchema = z.object({
    length_mm: z.coerce.number().min(0),
    radius_m: z.coerce.number().min(0),
    dimensions_mm: DimensionsSchema,
    binding_type: z.string().min(1, "Binding type is required"),
    is_preloaded_binding: z.boolean().optional().default(false),
})

export const BackpackPropsSchema = z.object({
    capacity_liters: z.coerce.number().min(0),
    back_length_size: z.string().min(1, "Size is required"),
    has_frame: z.boolean().optional().default(false),
})

export const TentPropsSchema = z.object({
    capacity_persons: z.coerce.number().min(1),
    water_resistance_mm: z.coerce.number().min(0),
    shape: z.string().min(1, "Shape is required"),
    is_double_wall: z.boolean().optional().default(false),
})

export const PolePropsSchema = z.object({
    is_adjustable: z.boolean().optional().default(false),
    adjustment_stages: z.coerce.number().min(0),
    length_range_mm: LengthRangeSchema,
    packed_length_mm: z.coerce.number().min(0),
    material: z.string().min(1, "Material is required"),
})

export const BootsPropsSchema = z.object({
    size_cm: z.coerce.number().min(0),
    sole_type: z.string().min(1, "Sole type is required"),
    // Simplification: using string for welt compatibility for now, or object?
    // Backend: WeltCompatibility { front: String, rear: String }
    welt_compatibility: z.object({
        front: z.string(),
        rear: z.string(),
    }),
    stiffness: z.string().min(1, "Stiffness is required"),
})

export const IceAxePropsSchema = z.object({
    shaft_shape: z.string().min(1, "Shaft shape is required"),
    length_mm: z.coerce.number().min(0),
    weight_balance: z.string().min(1, "Weight balance is required"),
})

export const CramponsPropsSchema = z.object({
    attachment_type: z.string().min(1, "Attachment type is required"),
    points_count: z.coerce.number().min(0),
    material: z.string().min(1, "Material is required"),
})

export const HardShellPropsSchema = z.object({
    water_resistance_mm: z.coerce.number().min(0),
    moisture_permeability_g: z.coerce.number().min(0),
    has_ventilation: z.boolean().optional().default(false),
    material_tech: z.string().min(1, "Material technology is required"),
})

// Union for properties
export const GearPropertiesSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("Ski"), data: SkiPropsSchema }),
    z.object({ type: z.literal("Backpack"), data: BackpackPropsSchema }),
    z.object({ type: z.literal("Tent"), data: TentPropsSchema }),
    z.object({ type: z.literal("Pole"), data: PolePropsSchema }),
    z.object({ type: z.literal("Boots"), data: BootsPropsSchema }),
    z.object({ type: z.literal("IceAxe"), data: IceAxePropsSchema }),
    z.object({ type: z.literal("Crampons"), data: CramponsPropsSchema }),
    z.object({ type: z.literal("HardShell"), data: HardShellPropsSchema }),
    z.object({ type: z.literal("Other"), data: z.any() }),
])

export const GearFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    manufacturer: z.string().min(1, "Manufacturer is required."),
    weight_g: z.coerce.number().min(0, "Weight must be positive."),
    price: z.coerce.number().min(0, "Price must be positive."),
    category: z.string().min(1, "Category is required."),
    // Properties are validated but not strongly typed in the main form object initially
    // because category determines the shape.
    // We will use a transformation or just rely on the dynamic form to produce the correct structure.
    properties: z.any(), // We will refine this or just trust the form logic for now
})

export type GearFormValues = z.infer<typeof GearFormSchema>
