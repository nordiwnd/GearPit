"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

// 1. バリデーションスキーマ
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().min(1, "Brand is required"),
  weightGram: z.coerce.number().min(0),
  category: z.string().min(1, "Category is required"),
  // z.record(key, value)
  properties: z.record(z.string(), z.any()).optional(), 
});

interface AddGearDialogProps {
  onSuccess: () => void;
}

export function AddGearDialog({ onSuccess }: AddGearDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      brand: "",
      weightGram: 0,
      category: "",
      // Fix: TypeScriptにこれが汎用オブジェクトであることを伝える
      properties: {} as Record<string, any>,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const payload = {
        ...values,
        properties: processProperties(values.category, values.properties),
      };

      // @ts-ignore
      await api.createItem(payload);
      
      form.reset();
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to create item", error);
      alert("登録に失敗しました");
    }
  }

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    form.setValue("category", val);
    form.setValue("properties", {});
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Add Gear</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Gear</DialogTitle>
          <DialogDescription>
            Add a new item to your inventory.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="Arc'teryx" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Alpha SV" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={handleCategoryChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ski">Skiing</SelectItem>
                        <SelectItem value="mountaineering">Mountaineering</SelectItem>
                        <SelectItem value="camp">Camping</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Input 
                        type="number" 
                        {...field} 
                        // Fix: 明示的にanyキャストして安全に渡す
                        value={(field.value as any) ?? ''} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedCategory && (
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                  {selectedCategory.toUpperCase()} Specifics
                </h4>
                {/* フォームオブジェクトを渡して動的フィールドを描画 */}
                {renderCategoryFields(selectedCategory, form)}
              </div>
            )}

            <DialogFooter>
              <Button type="submit">Save Item</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// --- Helper Functions ---

// form: any でRHFの厳格な型チェックをバイパス（動的フィールド用）
function renderCategoryFields(category: string, form: any) {
  switch (category) {
    case "ski":
      return (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="properties.sub_category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="board">Ski Board</SelectItem>
                    <SelectItem value="boots">Boots</SelectItem>
                    <SelectItem value="binding">Bindings</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="properties.length_cm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Length (cm)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    // Fix: field.valueが {} と推論されるのを防ぐ
                    value={(field.value as any) ?? ''} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      );
    case "camp":
      return (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="properties.sub_category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="tent">Tent</SelectItem>
                    <SelectItem value="sleeping_bag">Sleeping Bag</SelectItem>
                    <SelectItem value="cookware">Cookware</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="properties.capacity_person"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity (Person)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    value={(field.value as any) ?? ''} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      );
    default:
      return <div className="text-sm text-muted-foreground">No specific fields for this category.</div>;
  }
}

function processProperties(category: string, rawProps: any) {
  if (!rawProps) return {};
  const props = { ...rawProps };
  const numberFields = ["length_cm", "width_mm", "capacity_person", "flex"];
  
  Object.keys(props).forEach(key => {
    if (numberFields.includes(key) && props[key]) {
      props[key] = Number(props[key]);
    }
  });

  return props;
}