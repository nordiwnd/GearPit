import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation'; // 追加: router.refresh()用
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Loader2 } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { gearApi, GearItem, loadoutApi } from "@/lib/api";
import { WeightBudgetBar } from './weight-budget-bar';

const formSchema = z.object({
  name: z.string().min(1, "Loadout name is required"),
  activityType: z.string().min(1, "Activity type is required"),
  selectedItemIds: z.array(z.string()),
  targetWeightGram: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateLoadoutDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gears, setGears] = useState<GearItem[]>([]);
  const router = useRouter(); // 追加

  useEffect(() => {
    if (open) {
      gearApi.listItems().then(res => setGears(res || [])).catch(console.error);
    }
  }, [open]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      activityType: "",
      selectedItemIds: [],
      targetWeightGram: undefined,
    },
  });

  const selectedItemIds = form.watch("selectedItemIds");
  const selectedItems = useMemo(() => {
    return gears.filter(g => selectedItemIds.includes(g.id));
  }, [gears, selectedItemIds]);

  const targetWeightGram = form.watch("targetWeightGram");

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      // API呼び出し
      await loadoutApi.create({
        name: values.name,
        activityType: values.activityType,
        kitIds: [], // 今回はシンプルにアイテム直指定のみとする
        itemIds: values.selectedItemIds,
        targetWeightGram: values.targetWeightGram,
      });

      form.reset();
      setOpen(false);
      router.refresh(); // 追加: 画面の再描画をトリガー
    } catch (error) {
      console.error(error);
      alert("Failed to create loadout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Loadout
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle>Create New Loadout</DialogTitle>
          </DialogHeader>
        </div>

        <div className="overflow-y-auto px-6 pb-6 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Weight Budget Bar: Sticky top context within the form scroll if possible, or just placed here */}
              <div className="sticky top-0 z-10 bg-background pt-2 pb-4 -mx-1 px-1">
                <WeightBudgetBar
                  items={selectedItems}
                  targetWeightGram={targetWeightGram}
                  onTargetChange={(val) => form.setValue("targetWeightGram", val)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Ex: Summer Hike 2026" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="activityType" render={({ field }) => (
                  <FormItem><FormLabel>Activity</FormLabel><FormControl><Input placeholder="Ex: Hiking" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="space-y-2">
                <FormLabel>Select Gears</FormLabel>
                <div className="border rounded-md p-4 h-[300px] overflow-y-auto bg-muted/50">
                  <FormField control={form.control} name="selectedItemIds" render={() => (
                    <div className="space-y-2">
                      {gears.map((gear) => (
                        <FormField key={gear.id} control={form.control} name="selectedItemIds" render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border bg-card p-3 shadow-sm">
                            <FormControl>
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              <Checkbox checked={field.value?.includes(gear.id)} onCheckedChange={(checked) => checked ? field.onChange([...field.value, gear.id]) : field.onChange(field.value?.filter((v: any) => v !== gear.id))} />
                            </FormControl>
                            <div className="space-y-1 leading-none flex-1 flex justify-between">
                              <div>
                                <FormLabel className="font-medium text-foreground cursor-pointer">{gear.name}</FormLabel>
                                <p className="text-xs text-muted-foreground">{gear.properties?.brand || '-'}</p>
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

              <div className="flex justify-end pt-2 border-t">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Loadout
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}