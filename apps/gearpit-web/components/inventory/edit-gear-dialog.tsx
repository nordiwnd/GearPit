"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil, Loader2, Trash2 } from "lucide-react";

import { gearApi, GearItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner"; // Toastに変更

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  weightGram: z.string().regex(/^\d*$/, "Weight must be a positive number."),
  brand: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  usageCount: z.string().regex(/^\d*$/, "Usage count must be a number.").optional(),
  maintenanceInterval: z.string().regex(/^\d*$/, "Interval must be a number.").optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditGearDialogProps {
  item: GearItem;
  trigger?: React.ReactNode;
}

export function EditGearDialog({ item, trigger }: EditGearDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item.name,
      description: item.description || "",
      weightGram: item.weightGram.toString(),
      brand: item.properties?.brand || "",
      category: item.properties?.category || "",
      tags: item.tags?.join(", ") || "",
      usageCount: item.usageCount?.toString() || "0",
      maintenanceInterval: item.maintenanceInterval?.toString() || "0",
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      const tagsArray = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
      const weight = data.weightGram ? Number(data.weightGram) : 0;
      const usage = data.usageCount ? Number(data.usageCount) : 0;
      const interval = data.maintenanceInterval ? Number(data.maintenanceInterval) : 0;

      await gearApi.updateItem(item.id, {
        name: data.name,
        description: data.description || "",
        weightGram: weight,
        tags: tagsArray,
        usageCount: usage,
        maintenanceInterval: interval,
        properties: {
          brand: data.brand || "",
          category: data.category || "",
        },
      });

      setOpen(false);
      router.refresh();
      toast.success("Gear updated successfully");
    } catch (error) {
      toast.error("Failed to update gear");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Gear</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }: { field: any }) => (
              <FormItem><FormLabel>Item Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="brand" render={({ field }: { field: any }) => (
                <FormItem><FormLabel>Brand</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="weightGram" render={({ field }: { field: any }) => (
                <FormItem><FormLabel>Weight (g)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="maintenanceInterval" render={({ field }: { field: any }) => (
                <FormItem><FormLabel>Maint. Interval</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="usageCount" render={({ field }: { field: any }) => (
                <FormItem><FormLabel>Usage</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="category" render={({ field }: { field: any }) => (
              <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="tags" render={({ field }: { field: any }) => (
              <FormItem><FormLabel>Tags (comma-separated)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}