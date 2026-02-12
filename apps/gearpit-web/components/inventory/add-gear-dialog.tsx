"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { gearApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 修正: weightGram を文字列として定義し、数字のみ許可するバリデーションに変更
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  weightGram: z.string().regex(/^\d*$/, "Weight must be a positive number."),
  weightType: z.enum(["base", "consumable", "worn", "long"]),
  brand: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  usageCount: z.string().regex(/^\d*$/, "Usage count must be a number.").optional(),
  maintenanceInterval: z.string().regex(/^\d*$/, "Interval must be a number.").optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddGearDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      weightGram: "",
      weightType: "base",
      brand: "",
      category: "",
      tags: "",
      usageCount: "0",
      maintenanceInterval: "0",
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      const tagsArray = data.tags ? data.tags.split(",").map((t) => t.trim()) : [];
      const weight = data.weightGram ? Number(data.weightGram) : 0;
      const usage = data.usageCount ? Number(data.usageCount) : 0;
      const interval = data.maintenanceInterval ? Number(data.maintenanceInterval) : 0;

      await gearApi.createItem({
        name: data.name,
        description: data.description || "",
        weightGram: weight,
        weightType: data.weightType,
        tags: tagsArray,
        usageCount: usage,
        maintenanceInterval: interval,
        properties: {
          brand: data.brand || "",
          category: data.category || "",
        },
      });

      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      console.error("Failed to add gear", error);
      alert("Failed to save gear. Please check backend connection.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Gear
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Gear</DialogTitle>
          <DialogDescription>
            Register a new item to your armory.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Atomic Bent 100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Atomic" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weightGram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (g)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maintenanceInterval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maint. Interval (Trips)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0 = infinite" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="usageCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Usage</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="weightType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select weight type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="base">Base Weight (Carried)</SelectItem>
                      <SelectItem value="consumable">Consumable (Food/Water)</SelectItem>
                      <SelectItem value="worn">Worn (Clothing)</SelectItem>
                      <SelectItem value="long">Long Gear (Skis/Poles)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Skis, Tent" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="ski, winter, freeride" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Item"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}