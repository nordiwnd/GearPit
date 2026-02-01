"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api, GearItem } from "@/lib/api";

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

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().min(1, "Brand is required"),
  weightGram: z.coerce.number().min(0),
  category: z.string().min(1, "Category is required"),
  properties: z.record(z.string(), z.any()).optional(),
});

interface AddGearDialogProps {
  onSuccess: () => void;
  itemToEdit?: GearItem; // 編集対象 (あれば編集モード)
  trigger?: React.ReactNode; // トリガーボタンのカスタマイズ用
}

export function AddGearDialog({ onSuccess, itemToEdit, trigger }: AddGearDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const isEditMode = !!itemToEdit;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      brand: "",
      weightGram: 0,
      category: "",
      properties: {} as Record<string, any>,
    },
  });

  // ダイアログが開いたとき、または編集対象が変わったときにフォームを初期化
  useEffect(() => {
    if (open) {
      if (itemToEdit) {
        // 編集モード: 既存データをセット
        form.reset({
          name: itemToEdit.name,
          brand: itemToEdit.brand,
          weightGram: itemToEdit.weightGram,
          category: itemToEdit.category,
          properties: itemToEdit.properties || {},
        });
        setSelectedCategory(itemToEdit.category);
      } else {
        // 新規作成モード: リセット
        form.reset({
          name: "",
          brand: "",
          weightGram: 0,
          category: "",
          properties: {},
        });
        setSelectedCategory("");
      }
    }
  }, [open, itemToEdit, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const payload = {
        ...values,
        properties: processProperties(values.category, values.properties),
      };

      if (isEditMode && itemToEdit) {
        // Update
        // @ts-ignore
        await api.updateItem(itemToEdit.id, payload);
      } else {
        // Create
        // @ts-ignore
        await api.createItem(payload);
      }
      
      form.reset();
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to save item", error);
      alert("保存に失敗しました");
    }
  }

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    form.setValue("category", val);
    // カテゴリ変更時はプロパティをリセット（編集モードでもカテゴリを変えるならリセットすべき）
    form.setValue("properties", {});
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : <Button>+ Add Gear</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Gear" : "Add New Gear"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details of your gear." : "Add a new item to your inventory."}
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
                      <Input placeholder="Brand" {...field} value={field.value ?? ''} />
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
                      <Input placeholder="Name" {...field} value={field.value ?? ''} />
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
                    <Select onValueChange={handleCategoryChange} value={field.value}>
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
                {renderCategoryFields(selectedCategory, form)}
              </div>
            )}

            <DialogFooter>
              <Button type="submit">{isEditMode ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Helper Functions (前回と同じ)
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
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="board">Ski Board</SelectItem>
                    <SelectItem value="boots">Boots</SelectItem>
                    <SelectItem value="binding">Bindings</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
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
                <Select onValueChange={field.onChange} value={field.value || ""}>
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
                <FormLabel>Capacity</FormLabel>
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