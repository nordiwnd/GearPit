"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Loader2, Pencil } from 'lucide-react';
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { gearApi, GearItem, loadoutApi, Loadout } from "@/lib/api"; 

const formSchema = z.object({
  name: z.string().min(1, "Loadout name is required"),
  activityType: z.string().min(1, "Activity type is required"),
  selectedItemIds: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  loadoutToEdit?: Loadout; // 編集モードの場合はこれを渡す
  trigger?: React.ReactNode;
}

export function LoadoutFormDialog({ loadoutToEdit, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gears, setGears] = useState<GearItem[]>([]);
  const router = useRouter();

  // 編集モードかどうか
  const isEdit = !!loadoutToEdit;

  useEffect(() => {
    if (open) {
      gearApi.listItems().then(res => setGears(res || [])).catch(console.error);
    }
  }, [open]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: loadoutToEdit?.name || "",
      activityType: loadoutToEdit?.activityType || "",
      selectedItemIds: loadoutToEdit?.items?.map(i => i.id) || [],
    },
  });

  // Dialogが開くたびにFormをリセット（特に編集→新規作成の切り替え時など考慮）
  useEffect(() => {
    if (open) {
      form.reset({
        name: loadoutToEdit?.name || "",
        activityType: loadoutToEdit?.activityType || "",
        selectedItemIds: loadoutToEdit?.items?.map(i => i.id) || [],
      });
    }
  }, [open, loadoutToEdit, form]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const payload = {
        name: values.name,
        activityType: values.activityType,
        kitIds: [],
        itemIds: values.selectedItemIds,
      };

      if (isEdit && loadoutToEdit) {
        await loadoutApi.update(loadoutToEdit.id, payload);
        toast.success("Loadout updated successfully");
      } else {
        await loadoutApi.create(payload);
        toast.success("Loadout created successfully");
      }

      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(isEdit ? "Failed to update loadout" : "Failed to create loadout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Loadout
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Loadout" : "Create New Loadout"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col min-h-0">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Ex: Summer Hike 2026" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="activityType" render={({ field }) => (
                <FormItem><FormLabel>Activity</FormLabel><FormControl><Input placeholder="Ex: Hiking" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="space-y-2 flex-1 flex flex-col min-h-0">
              <FormLabel>Select Gears</FormLabel>
              <div className="border rounded-md p-4 overflow-y-auto bg-zinc-50/50 flex-1">
                <FormField control={form.control} name="selectedItemIds" render={() => (
                  <div className="space-y-2">
                    {gears.map((gear) => (
                      <FormField key={gear.id} control={form.control} name="selectedItemIds" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border bg-white p-3 shadow-sm">
                          <FormControl>
                            <Checkbox checked={field.value?.includes(gear.id)} onCheckedChange={(checked) => checked ? field.onChange([...field.value, gear.id]) : field.onChange(field.value?.filter((v) => v !== gear.id))} />
                          </FormControl>
                          <div className="space-y-1 leading-none flex-1 flex justify-between">
                            <div>
                              <FormLabel className="font-medium text-zinc-900 cursor-pointer">{gear.name}</FormLabel>
                              <p className="text-xs text-zinc-500">{gear.properties?.brand || '-'}</p>
                            </div>
                            <Badge variant="outline" className="ml-auto font-mono">{gear.weightGram}g</Badge>
                          </div>
                        </FormItem>
                      )} />
                    ))}
                  </div>
                )} />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {isEdit ? "Save Changes" : "Create Loadout"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}