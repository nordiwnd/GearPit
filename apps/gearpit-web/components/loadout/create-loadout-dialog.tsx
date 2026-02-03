'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Loader2 } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
// 修正: api -> gearApi
import { gearApi, GearItem } from "@/lib/api"; 

const formSchema = z.object({
  name: z.string().min(1, "Loadout name is required"),
  selectedItemIds: z.array(z.string()).min(1, "Select at least one item"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  onSuccess: () => void;
}

export function CreateLoadoutDialog({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gears, setGears] = useState<GearItem[]>([]);

  useEffect(() => {
    if (open) {
      // 修正: 実際にDBからギアリストを取得する
      gearApi.listItems()
        .then(res => setGears(res || []))
        .catch(console.error);
    }
  }, [open]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      selectedItemIds: [],
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      // 修正: Loadout作成は未実装のため、コンソール出力して閉じるだけにする
      console.log("Loadout payload (WIP):", values);
      alert("Loadout feature is under development (Phase 2.2).");

      form.reset();
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error(error);
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
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Loadout (Coming Soon)</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loadout Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Summer Hike 2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Select Gears</FormLabel>
              <div className="border rounded-md p-4 h-[300px] overflow-y-auto bg-zinc-50/50">
                <FormField
                  control={form.control}
                  name="selectedItemIds"
                  render={() => (
                    <div className="space-y-2">
                      {gears.map((gear) => (
                        <FormField
                          key={gear.id}
                          control={form.control}
                          name="selectedItemIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={gear.id}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border bg-white p-3 shadow-sm"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(gear.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, gear.id])
                                        : field.onChange(field.value?.filter((value) => value !== gear.id))
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none flex-1 flex justify-between">
                                  <div>
                                    <FormLabel className="font-medium text-zinc-900 cursor-pointer">
                                      {gear.name}
                                    </FormLabel>
                                    <p className="text-xs text-zinc-500">{gear.properties?.brand || '-'}</p>
                                  </div>
                                  <Badge variant="outline" className="ml-auto font-mono">
                                    {gear.weightGram}g
                                  </Badge>
                                </div>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                  )}
                />
              </div>
              <FormMessage />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Calculate & Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}